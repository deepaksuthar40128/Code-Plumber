package utils

import (
	"fmt"
	"math/rand"
	"os"
	"regexp"
	"time"
)

type IncomingDataType struct {
	Code     string `json:"code"`
	Language string `json:"language"`
	Input    string `json:"input"`
}

type OutgoingDataType struct {
	Success    bool   `json:"success"`
	Error      bool   `json:"error"`
	Message    string `json:"message"`
	Time       int  `json:"time"`
	Data       string `json:"data"`
	StatusCode int  `json:"statusCode"`
}

func ExtensionMapper(language string) string {
	switch language {
	case "cpp":
		return ".cpp"
	case "c":
		return ".c"
	default:
		return ".txt"
	}
}

func FilterInput(input *string) {
	re := regexp.MustCompile(`^\s+/gm`)
	*input = re.ReplaceAllString(*input, "")
	re = regexp.MustCompile((`\s+`))
	*input = re.ReplaceAllString(*input, " ")
}

func FileMaker(data IncomingDataType) (*os.File, *os.File) {
	fileName := fmt.Sprint(rand.Int()) + fmt.Sprint(time.Now().UTC().UnixNano()) + "-Main" + ExtensionMapper(data.Language)
	fmt.Println(fileName)
	f, err := os.Create("runEnv/code/cpp/" + fileName)
	if err != nil {
		fmt.Println(err)
		panic(fmt.Sprintf("Error during creating file %v", fileName))
	}
	defer f.Close()
	f.Write([]byte(data.Code))

	InputFileName := fmt.Sprint(rand.Int()) + fmt.Sprint(time.Now().UTC().UnixNano()) + "-input.txt"
	inputf, err := os.Create("runEnv/input/" + InputFileName)
	if err != nil {
		panic("Error during creating input file")
	}
	defer inputf.Close()
	inputf.Write([]byte(data.Input))
	return f, inputf
}
