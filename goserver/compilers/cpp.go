package compilers

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"

	"github.com/deepaksuthar40128/plumber/utils"
)

func CppCompiler(f *os.File, inputf *os.File) utils.OutgoingDataType {
	cmd := exec.Command("g++", "-o", "./runEnv/exe/a.exe", "./"+f.Name())

	var stderr bytes.Buffer 
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		fmt.Println("Command execution failed:", err)
		fmt.Println("Error details:", stderr.String())
		return utils.OutgoingDataType{
			Success: true,
			Error: true,
			Message: "Compilation error",
			Data: func() string{ 
				if a:=stderr.String();len(a)!=0{
					return a;
				}else if a:=fmt.Sprintln(err);len(a)!=0{
					return a
				}
				return "Compilation error"
			}(),
			Time:0,
			StatusCode: 200,
		} 
	}
	return utils.OutgoingDataType{

	}
}
