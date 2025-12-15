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
	port := 8080

	if _, err := os.Stat(hlsDir); os.IsNotExist(err) {
		_ = os.Mkdir(hlsDir, 0755)
	}

	fs := http.FileServer(http.Dir(hlsDir))

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rawPath := strings.TrimPrefix(r.URL.Path, "/hls/")
		rawPath = strings.TrimSuffix(rawPath, "/")

		parts := strings.SplitN(rawPath, "/", 2)
		episodeID := parts[0]

        realFolderName, err := findFolderByID(hlsDir, episodeID)
        if err != nil {
            http.Error(w, "Episode not found", http.StatusNotFound)
            return
        }

        if len(parts) == 1 {
            expectedPath := filepath.Join(hlsDir, realFolderName, "video.m3u8")

            if _, err := os.Stat(expectedPath); err == nil {
                newURL := fmt.Sprintf("/hls/%s/video.m3u8", episodeID)
                http.Redirect(w, r, newURL, http.StatusFound)
                return
            } else {
                log.Printf("ERROR: video.m3u8 not found at %s", expectedPath)
                http.Error(w, "Master playlist not found", http.StatusNotFound)
                return
            }
        }

        fileRequest := parts[1]
        r.URL.Path = fmt.Sprintf("/%s/%s", realFolderName, fileRequest)

        fs.ServeHTTP(w, r)
	})

	http.Handle("/hls/", withCORS(handler))

	fmt.Printf("Starting HLS server on http://localhost:%d/hls/\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func findFolderByID(rootDir, id string) (string, error) {
    entries, err := os.ReadDir(rootDir)
    if err != nil {
        return "", err
    }

    for _, entry := range entries {
        if entry.IsDir() {
            parts := strings.Split(entry.Name(), " - ")
            if len(parts) == 3 && parts[2] == id {
                return entry.Name(), nil
            }
        }
    }
    return "", fmt.Errorf("folder with id %s not found", id)
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