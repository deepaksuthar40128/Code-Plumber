package main

import (
	"fmt"
	"net/http"

	"github.com/deepaksuthar40128/plumber/controller"
)

func main() {
	mux := http.NewServeMux()
	fs := http.FileServer(http.Dir("../client/dist"))
	mux.Handle("/", fs)
	controller.CompilerRoutes(mux, "/compiler")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		fmt.Println("err during listening")
	}
}
