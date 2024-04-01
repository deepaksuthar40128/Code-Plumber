package compilers

import (
	"bytes"
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
	cmd := exec.Command("gcc", "-o", execFile.Name(), "./"+f.Name())
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		return utils.OutgoingDataType{
			Success:    true,
			Error:      true,
			Message:    "Compilation error",
			Data:       stderr.String(),
			Time:       0,
			StatusCode: 200,
		}
	}
	inputf.Close()
	inputf, err := os.Open(inputf.Name())
	if err != nil {
		panic("Error during reopening of file!")
	}

	cmd = exec.Command(execFile.Name())
	cmd.Stdin = inputf

	var stdout, stderrOutput bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderrOutput

	outputChannel := make(chan utils.OutgoingDataType)

	go func() {
		nchannel := make(chan utils.OutgoingDataType)
		go func() {
			startTime := time.Now()
			if err := cmd.Run(); err != nil {
				outputChannel <- utils.OutgoingDataType{
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
		case <-time.After(time.Second):
			outputChannel <- utils.OutgoingDataType{
				Success:    true,
				Error:      true,
				Message:    "Time Limit Exceeded",
				Data:       utils.BufferOverflowCheck(&stdout),
				Time:       1000,
				StatusCode: 200,
			}
			cmd.Process.Kill()
		}
	}()

	output := <-outputChannel

	return output

}
