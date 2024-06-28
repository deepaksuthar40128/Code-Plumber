package main

import (
	"encoding/json"
	"fmt"
	"net"

	"github.com/deepaksuthar40128/plumber/controller"
	"github.com/deepaksuthar40128/plumber/utils"
)

func main() {
	serverAddr := "api-service:4555"

	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		fmt.Println("Error connecting to server:", err)
		return
	}
	defer conn.Close()

	fmt.Println("Connected to server on", serverAddr)

	startupMsg := map[string]string{"type": "Startup", "service": "Go1"}
	err = sendJSONMessage(conn, startupMsg)
	if err != nil {
		fmt.Println("Error sending startup message:", err)
		return
	}

	// Listen for incoming messages
	for {
		var msg map[string]interface{}
		err := receiveJSONMessage(conn, &msg)
		if err != nil {
			fmt.Println("Error receiving message:", err)
			return
		} 

		if msg["type"] == "Run" {
			dataMap := msg["data"].(map[string]interface{})
			incomingdata := utils.IncomingDataType{
				Code:     dataMap["code"].(string),
				Input:    dataMap["input"].(string),
				Language: dataMap["language"].(string),
			}
			response := map[string]interface{}{
				"type": "result",
				"id":   msg["id"],
				"data": controller.Compiler(incomingdata),
			}
			err := sendJSONMessage(conn, response)
			if err != nil {
				fmt.Println("Error sending response:", err)
				return
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
