package utils

import (
	"bytes"
	"fmt"
	"math/rand"
	"os"
	"regexp"
	"slices"
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
	Time       int    `json:"time"`
	Data       string `json:"data"`
	StatusCode int    `json:"statusCode"`
}

func SupportedLanguage(language string)bool{
	supportedLanguages:=[]string{"cpp","c","python","java"}
	return slices.Contains(supportedLanguages,language)
}

func ExtensionMapper(language string) string {
	switch language {
	case "cpp":
		return ".cpp"
	case "c":
		return ".c"
	case "python":
		return ".py"
	case "java":
		return ".java"
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
	f, err := os.Create("runEnv/code/" + data.Language + "/" + fileName)
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

func CustomFileMaker(fileType string) *os.File {
	fileName := fmt.Sprint(rand.Int()) + fmt.Sprint(time.Now().UTC().UnixNano()) + "-Exe" + fileType
	f, err := os.Create("runEnv/exe/" + fileName)
	if err != nil {
		panic("Error during creating executable file!")
	}
	defer f.Close()
	return f
}

func RemoveFile(file *os.File) {
	if _,err:=os.Lstat(file.Name());err==nil{
		err := os.Remove(file.Name())
		if err != nil {
			fmt.Println(err)
			panic("Error during removing file!")
		}
	}
}



func BufferOverflowCheck(stdout *bytes.Buffer) string{
	if res:=(*stdout).String();len(res)<1e5{
		return res
	}else{
		runs:=[]rune(res)
		runs = runs[:5000]
		return string(runs)+"........\n\n Buffer Overflow"
	} 
}