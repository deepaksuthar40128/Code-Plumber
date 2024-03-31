package controller

import (
	"encoding/json" 
	"net/http" 

	"github.com/deepaksuthar40128/plumber/compilers"
	"github.com/deepaksuthar40128/plumber/utils"
)

func CompilerRoutes(mux *http.ServeMux,prefix string){
	mux.Handle(prefix+"/run",http.HandlerFunc(compiler))
}


func compiler(w http.ResponseWriter,r * http.Request){
	var rawData utils.IncomingDataType
	err := json.NewDecoder(r.Body).Decode(&rawData)
	if err != nil{
		panic("Error during data")
	} else if len(rawData.Code)==0{
		panic("Empty Code block")
	} else if len(rawData.Language) == 0 {
		panic("Language undefined");
	}
	utils.FilterInput(&rawData.Input)
	f,inputf:=utils.FileMaker(rawData)
	var responseData utils.OutgoingDataType
	switch rawData.Language {
	case "cpp":
		responseData = compilers.CppCompiler(f,inputf);
	}
	w.WriteHeader(responseData.StatusCode)
	w.Header().Set("Content-Type","application/json")
	jsonData,err:=json.Marshal(responseData)
	w.Write(jsonData)
}

