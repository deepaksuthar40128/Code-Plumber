package compilers

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/deepaksuthar40128/plumber/utils"
)

func PYCompiler(f *os.File, inputf *os.File) utils.OutgoingDataType {
	defer func() {
		f.Close()
		inputf.Close()
		utils.RemoveFile(f)
		utils.RemoveFile(inputf)
	}()

	
	inputf.Close()
	inputf, err := os.Open(inputf.Name())
	if err != nil {
		panic("Error reopening input file")
	}

	pyFileName := utils.FileNameExtractor(f)
	inputFileName := utils.FileNameExtractor(inputf)
	pyContainerId:=os.Getenv("pyContainerId") 
	// fmt.Println("Hello")
	// pyContainerId:="01c"
	
	dockerCmd := exec.Command("docker", "exec", pyContainerId, "sh", "-c", "python3 runEnv/"+pyFileName+" < runEnv/"+inputFileName)

	var stdout, stderrOutput bytes.Buffer
	dockerCmd.Stdout = &stdout
	dockerCmd.Stderr = &stderrOutput

	outputChannel := make(chan utils.OutgoingDataType)

	go func() {
		nchannel := make(chan utils.OutgoingDataType)
		go func() {
			startTime := time.Now()
			if err := dockerCmd.Run(); err != nil {
				fmt.Println(err)
				nchannel <- utils.OutgoingDataType{
					Success:    true,
					Error:      true,
					Message:    "Runtime error",
					Data:       stderrOutput.String(),
					Time:       int(time.Since(startTime) / 1e6), 
					StatusCode: 200,
				}
				return
			}

			nchannel <- utils.OutgoingDataType{
				Success:    true,
				Error:      false,
				Message:    "Run successfully",
				Data:       utils.BufferOverflowCheck(&stdout),
				Time:       int(time.Since(startTime) / 1e6),  
				StatusCode: 200,
			}
		}()

		select {
		case res := <-nchannel:
			outputChannel <- res
		case <-time.After(3 * time.Second):
			outputChannel <- utils.OutgoingDataType{
				Success:    true,
				Error:      true,
				Message:    "Time Limit Exceeded",
				Data:       utils.BufferOverflowCheck(&stdout),
				Time:       3000, 
				StatusCode: 200,
			}
			if dockerCmd.Process != nil {
				dockerCmd.Process.Kill()
			}
		}
	}()

	output := <-outputChannel
	return output
}
