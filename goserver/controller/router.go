package controller

import (
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/deepaksuthar40128/plumber/compilers"
)

func CompilerRoutes(mux *http.ServeMux,prefix string){
	mux.Handle(prefix+"/run",http.HandlerFunc(compiler))
}


func compiler(w http.ResponseWriter,r * http.Request){
	var rawData compilers.IncomingDataType
	err := json.NewDecoder(r.Body).Decode(&rawData)
	if err != nil{
		panic("Error during data")
	}
	re:=regexp.MustCompile(`^\s+/gm`)
	rawData.Input = re.ReplaceAllString(rawData.Input,"");
	re =regexp.MustCompile((`\s+`))
	rawData.Input = re.ReplaceAllString(rawData.Input," ");
	switch rawData.Language {
	case "cpp":
		compilers.CppCompiler(rawData);
	}
}