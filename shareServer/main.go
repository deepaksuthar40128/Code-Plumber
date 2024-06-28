package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"

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

	connStr,isEnvPresent := os.LookupEnv("DATABASE_URL")
	if !isEnvPresent{
		log.Fatal("No DB URL")
	}
	db, err := controller.MakeConnection(connStr)
	if err != nil {
		fmt.Println(err)
		log.Fatal("Error during db connection!")
	}
	defer db.Close()
	fmt.Println("Connected to DB ")

	startupMsg := map[string]string{"type": "Startup", "service": "Go2"}
	err = sendJSONMessage(conn, startupMsg)
	if err != nil {
		fmt.Println("Error sending startup message:", err)
		return
	}

	//queue to store window item id
	store := utils.NewQueue()
	controller.Collactor(store,db)

	// Listen for incoming messages
	for {
		var msg utils.IncomingRawDataType
		err := receiveJSONMessage(conn, &msg)
		if err != nil {
			fmt.Println("Error receiving message:", err)
			return
		}
		if msg.Type == "Upload" {
			var dataMap utils.IncomingDataTypes
			if err := map2Json(msg.Data, &dataMap); err != nil {
				log.Fatalln("Error during conversion")
			}
			response := map[string]interface{}{
				"type": "Uploaded",
				"id":   msg.Id,
				"data": controller.Upload(dataMap, db, store),
			}
			err := sendJSONMessage(conn, response)
			if err != nil {
				fmt.Println("Error sending response:", err)
				return
			}
		} else if msg.Type == "Fetch" {
			var dataMap utils.RequestIncomingDataType
			if err := map2Json(msg.Data, &dataMap); err != nil {
				fmt.Println(err)
				log.Fatalln("Error during conversion")
			}
			response := map[string]interface{}{
				"type": "Fetch",
				"id":   msg.Id,
				"data": controller.Fetch(dataMap, db),
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
	// fmt.Println(string(jsonData))
	if err != nil {
		return err
	}
	_, err = conn.Write(append(jsonData, "$end$"...))
	return err
}

func receiveJSONMessage(conn net.Conn, msg *utils.IncomingRawDataType) error {
	decoder := json.NewDecoder(conn)
	return decoder.Decode(msg)
}

func map2Json(mp interface{}, s interface{}) error {
	jsonData, err := json.Marshal(mp)
	if err != nil {
		return err
	}
	if err := json.Unmarshal(jsonData, s); err != nil {
		return err
	}
	return nil
}
