package controller

import (
	"encoding/json"
	"fmt"

	"github.com/deepaksuthar40128/plumber/compilers"
	"github.com/deepaksuthar40128/plumber/utils"
)

func Compiler(rawData utils.IncomingDataType) string {
	fmt.Println(rawData)
	if len(rawData.Code) == 0 {
		return responseCreater(utils.OutgoingDataType{
			Success:    false,
			Message:    "Code Block cannot be empty!",
			StatusCode: 200,
		})
	} else if len(rawData.Language) == 0 || !utils.SupportedLanguage(rawData.Language) {
		return responseCreater(utils.OutgoingDataType{
			Success:    false,
			Message:    "Undefined or unsupported Language!",
			StatusCode: 200,
		})
	}
	utils.FilterInput(&rawData.Input)
	f, inputf := utils.FileMaker(rawData)

	var responseData utils.OutgoingDataType
	switch rawData.Language {
	case "cpp":
		responseData = compilers.CppCompiler(f, inputf)
	case "c":
		responseData = compilers.CCompiler(f, inputf)
	case "python":
		responseData = compilers.PYCompiler(f, inputf)
	case "java":
		responseData = compilers.JAVACompiler(f, inputf)
	}
	return responseCreater(responseData)
}

func responseCreater(data utils.OutgoingDataType) string {
	jsonData, err := json.Marshal(data)
	if err != nil {
		panic("Error occured during creating json")
	}
	return string(jsonData)
}
