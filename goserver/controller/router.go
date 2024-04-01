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
		responseCreater(w,utils.OutgoingDataType{
			Success: false,
			Message:"Error!",
			StatusCode: 500,
		})
		return
	}else if len(rawData.Code)==0{
		responseCreater(w,utils.OutgoingDataType{
			Success: false,
			Message:"Code Block cannot be empty!",
			StatusCode: 200,
		})
		return
	} else if len(rawData.Language) == 0 {
		responseCreater(w,utils.OutgoingDataType{
			Success: false,
			Message:"Undefined or unsupported Language!",
			StatusCode: 200,
		})
		return
	}
	utils.FilterInput(&rawData.Input)
	f,inputf:=utils.FileMaker(rawData)

	var responseData utils.OutgoingDataType
	switch rawData.Language {
	case "cpp":
		responseData = compilers.CppCompiler(f,inputf);
	}
	responseCreater(w,responseData)
}


func responseCreater(w http.ResponseWriter,data utils.OutgoingDataType){
	w.WriteHeader(data.StatusCode)
	w.Header().Set("Content-Type","application/json")
	jsonData,err:=json.Marshal(data)
	if err!=nil{
		panic("Error occured during creating json")
	}
	w.Write(jsonData)
}