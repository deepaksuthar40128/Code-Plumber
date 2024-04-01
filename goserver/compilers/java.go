package compilers

import (
	"bytes" 
	"os"
	"os/exec"
	"time"

	"github.com/deepaksuthar40128/plumber/utils"
)

func JAVACompiler(f *os.File, inputf *os.File)utils.OutgoingDataType {
	defer func() {
		f.Close()
		inputf.Close()
		utils.RemoveFile(f)
		utils.RemoveFile(inputf)
	}()
	cmd := exec.Command("java", f.Name())
	var stdout bytes.Buffer
	cmd.Stderr = &stdout
	cmd.Stdout = &stdout
	inputf.Close()
	inputf, err := os.Open(inputf.Name())
	if err != nil {
		panic("Error during reopening input file")
		
	}
	cmd.Stdin = inputf
	output := make(chan utils.OutgoingDataType)
	go func() {
		nchannel := make(chan utils.OutgoingDataType)
		go func() {
			startTime := time.Now()
			if err := cmd.Run(); err != nil { 
				nchannel <- utils.OutgoingDataType{
					Success:    true,
					Error:      true,
					Message:    "Execution Terminated Due to Some Error",
					Data:       utils.BufferOverflowCheck(&stdout),
					Time:       0,
					StatusCode: 200,
				}
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
			output <- res
		case <-time.After(2 * time.Second):
			output <- utils.OutgoingDataType{
				Success:    true,
				Error:      true,
				Message:    "Time Limit Exceeded",
				Data:       utils.BufferOverflowCheck(&stdout),
				Time:       2000,
				StatusCode: 200,
			}
			cmd.Process.Kill()
		}
	}()
	return <-output
}
