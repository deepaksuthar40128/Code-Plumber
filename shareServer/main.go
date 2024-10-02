package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"time"

	"github.com/deepaksuthar40128/plumber/controller"
	"github.com/deepaksuthar40128/plumber/utils"
)

func main() {
	// serverAddr := "api-service:4555"
	serverAddr := "nginx:4555"
	// serverAddr := "127.0.0.1:4555"
	connectToServer(serverAddr)
}

func connectToServer(serverAddr string) {
	up:
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		fmt.Println("Error connecting to server:", err, "Retrying in 10 seconds...")
		time.Sleep(10 * time.Second)
		goto up
	}
	defer conn.Close()
	fmt.Println("Connected to server on", serverAddr)

	connStr, isEnvPresent := os.LookupEnv("DATABASE_URL")
	if !isEnvPresent {
		log.Fatal("No DB URL found in environment variables")
	}
	db, err := controller.MakeConnection(connStr)
	if err != nil {
		fmt.Println("Error during DB connection:", err)
		log.Fatal("Failed to connect to database")
	}
	defer db.Close()
	fmt.Println("Connected to DB")

	startupMsg := map[string]string{"type": "Startup", "service": "Go2"}
	err = sendJSONMessage(conn, startupMsg)
	if err != nil {
		fmt.Println("Error sending startup message:", err)
		return
	}

	store := utils.NewQueue()
	controller.Collactor(store, db)
 
	for {
		var msg utils.IncomingRawDataType
		err := receiveJSONMessage(conn, &msg)
		if err != nil {
			fmt.Println("Error receiving message, retrying connection:", err)
			time.Sleep(10 * time.Second)
			goto up;
		}
		processMessage(msg, conn, db, store)
	}
}

func processMessage(msg utils.IncomingRawDataType, conn net.Conn, db *sql.DB, store *utils.Queue) {
	if msg.Type == "Upload" {
		var dataMap utils.IncomingDataTypes
		if err := map2Json(msg.Data, &dataMap); err != nil {
			log.Println("Error during conversion:", err)
			return
		}
		response := map[string]interface{}{
			"type": "Uploaded",
			"id":   msg.Id,
			"data": controller.Upload(dataMap, db, store),
		}
		if err := sendJSONMessage(conn, response); err != nil {
			fmt.Println("Error sending response:", err)
		}
	} else if msg.Type == "Fetch" {
		var dataMap utils.RequestIncomingDataType
		if err := map2Json(msg.Data, &dataMap); err != nil {
			fmt.Println("Error during conversion:", err)
			return
		}
		response := map[string]interface{}{
			"type": "Fetch",
			"id":   msg.Id,
			"data": controller.Fetch(dataMap, db),
		}
		if err := sendJSONMessage(conn, response); err != nil {
			fmt.Println("Error sending response:", err)
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
