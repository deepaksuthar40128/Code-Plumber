package main

import (
	"encoding/json"
	"fmt"
	"net"
	"time"

	"github.com/deepaksuthar40128/plumber/controller"
	"github.com/deepaksuthar40128/plumber/utils"
)

func main() {
	// serverAddr := "127.0.0.1:4555"
	serverAddr := "nginx:4555"
	// serverAddr := "api-service:4555"

	for { 
		conn, err := connectToServer(serverAddr)
		if err != nil {
			fmt.Println("Error connecting to server:", err, "Retrying in 10 seconds...")
			time.Sleep(10 * time.Second)
			continue 
		}
 
		err = handleConnection(conn)
		if err != nil {
			fmt.Println("Connection lost. Retrying in 10 seconds...")
			time.Sleep(10 * time.Second)
		}
	}
}
 
func connectToServer(serverAddr string) (net.Conn, error) {
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		return nil, err
	}
	fmt.Println("Connected to server on", serverAddr)
	return conn, nil
}
 
func handleConnection(conn net.Conn) error {
	defer conn.Close()
 
	startupMsg := map[string]string{"type": "Startup", "service": "Go1"}
	err := sendJSONMessage(conn, startupMsg)
	if err != nil {
		return fmt.Errorf("error sending startup message: %v", err)
	}
 
	for {
		var msg map[string]interface{}
		err := receiveJSONMessage(conn, &msg)
		if err != nil {
			fmt.Println("Error receiving message:", err)
			return err 
		}

		if msg["type"] == "Run" {
			dataMap := msg["data"].(map[string]interface{})
			incomingData := utils.IncomingDataType{
				Code:     dataMap["code"].(string),
				Input:    dataMap["input"].(string),
				Language: dataMap["language"].(string),
			}
 
			response := map[string]interface{}{
				"type": "result",
				"id":   msg["id"],
				"data": controller.Compiler(incomingData),
			}
			err := sendJSONMessage(conn, response)
			if err != nil {
				return fmt.Errorf("error sending response: %v", err)
			}
		}
	}
}

func sendJSONMessage(conn net.Conn, msg interface{}) error {
	jsonData, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	_, err = conn.Write(append(jsonData, "$end$"...))
	return err
}

func receiveJSONMessage(conn net.Conn, msg interface{}) error {
	decoder := json.NewDecoder(conn)
	return decoder.Decode(msg)
}
