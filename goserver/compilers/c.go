package compilers

import (
	"bytes"
	"fmt"
	"os"
	"os/exec" 
	"time"
	"github.com/deepaksuthar40128/plumber/utils"
)

func CCompiler(f *os.File, inputf *os.File) utils.OutgoingDataType {
	execFile := utils.CustomFileMaker(".out") 

	defer func() {
		f.Close()
		inputf.Close()
		execFile.Close()
		utils.RemoveFile(f)
		utils.RemoveFile(inputf)
		utils.RemoveFile(execFile)
	}()

	
	cmd := exec.Command("g++", "-o", execFile.Name(), "./"+f.Name())
	exec.Command("chmod", "+x", execFile.Name()).Run()

	var compileStderr bytes.Buffer
	cmd.Stderr = &compileStderr

	if err := cmd.Run(); err != nil {
		return utils.OutgoingDataType{
			Success:    true,
			Error:      true,
			Message:    "Compilation error",
			Data:       compileStderr.String(),
			Time:       0,
			StatusCode: 200,
		}
	}

	inputf.Close()
	inputf, err := os.Open(inputf.Name())
	if err != nil {
		panic("Error opening input file")
	}

	exeFileName:=utils.FileNameExtractor(execFile)
	inputFileName:=utils.FileNameExtractor(inputf)

	dockerCmd := exec.Command("docker", "run", "--rm", "--privileged",
		"-v", "/root/abc/Code-Plumber/runEnv/exe/"+exeFileName+":/app/output",
		"-v", "/root/abc/Code-Plumber/runEnv/input/"+inputFileName+":/app/input",
		"gcc:latest", "sh", "-c", "/app/output < /app/input")

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
		case <-time.After(3*time.Second):
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
