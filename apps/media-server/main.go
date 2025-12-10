package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	// * Directory obsahující data s videii - Změňte tuto cestu, pokud se data nachází jinde.
	hlsDir := "./videos"

	// ! Zde checkuji zda directory existuje a pokud ne vypíšu do konzole kritickou chybu (Fatal Error).
	if _, err := os.Stat(hlsDir); os.IsNotExist(err) {
		log.Fatalf("HLS directory %s does not exist", hlsDir)
	}

	// * Tady si vytvořím File Server pro statické soubory (M3U8 playlisty a TS segmenty) z adresáře 'hlsDir'.
	fs := http.FileServer(http.Dir(hlsDir))

	// TODO: Nastavení handleru pro cestu "/hls/".
	// http.StripPrefix("/hls/", fs) zajistí, že z URL (např. /hls/video.m3u8) se odstraní "/hls/" a FileServer pak hledá soubor "video.m3u8" v "./videos".
	// wrapped s withCORS() pro správné nastavení hlaviček pro přehrávače v prohlížečích.
	http.Handle("/hls/", withCORS(http.StripPrefix("/hls/", fs)))

	// * Zde spustím HTTP server na definovaném portu.
	port := 8080
	fmt.Printf("Starting HLS server on http://localhost:%d/hls/\n", port)

	// ! log.Fatal spustí server a v případě chyby při startu (např. obsazený port) program ukončí a vypíše chybu.
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