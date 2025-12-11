package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	hlsDir := "./videos"

	fs := http.FileServer(http.Dir(hlsDir))

	http.Handle("/hls/", withCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/hls/")

		path = strings.TrimSuffix(path, "/")

		ext := filepath.Ext(path)
		
		if path != "" && ext == "" {

			expectedRelativePath := filepath.Join(hlsDir, path, path+".m3u8")

			if _, err := os.Stat(expectedRelativePath); err == nil {
				newURL := fmt.Sprintf("/hls/%s/%s.m3u8", path, path)
				http.Redirect(w, r, newURL, http.StatusFound)
				return
			} else {
				log.Printf("ERROR: File not found at %s. (Error: %v)", expectedRelativePath, err)
			}
		}

		http.StripPrefix("/hls/", fs).ServeHTTP(w, r)
	})))

	port := 8080
	fmt.Printf("Starting HLS server on http://localhost:%d/hls/\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

// # Funkce pro úpravu hlaviček a řešení CORS (Cross-Origin Resource Sharing).
// Tato funkce obaluje (wrapper) jakýkoliv http.Handler, aby přidala potřebné CORS hlavičky.
func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// * Povoluje přístup z jakékoliv domény.
		w.Header().Set("Access-Control-Allow-Origin", "*")

		// * Povoluje metody GET a OPTIONS.
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")

		// * Povoluje všechny hlavičky v požadavku.
		w.Header().Set("Access-Control-Allow-Headers", "*")

		// ? Speciální ošetření pro preflight OPTIONS požadavek:
		// Webové prohlížeče posílají OPTIONS před skutečným GET, aby se ujistily o povoleních.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return // Ukončí se zde, nepropouští se do originálního handleru.
		}

		// * Pokračuje se ke skutečnému handleru (FileServer) pro metody GET.
		h.ServeHTTP(w, r)
	})
}