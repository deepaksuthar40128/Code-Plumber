package main

import (
	"fmt"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/deepaksuthar40128/plumber/controller"
)

const FSPATH = "../client/dist"

func main() {
	mux := http.NewServeMux()
	fs := http.FileServer(http.Dir(FSPATH))
	controller.CompilerRoutes(mux, "/compiler")
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			fullPath := FSPATH + strings.TrimPrefix(path.Clean(r.URL.Path), "/")
			_, err := os.Stat(fullPath)
			if err != nil {
				if !os.IsNotExist(err) {
					panic("Something wrong during file lookup!")
				}
				r.URL.Path = "/"
			}
		}
		fs.ServeHTTP(w, r)
	}))
	if err := http.ListenAndServe(":8080", mux); err != nil {
		fmt.Println("err during listening")
	}
}
