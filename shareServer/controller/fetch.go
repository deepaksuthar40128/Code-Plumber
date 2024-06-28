package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"

	"github.com/deepaksuthar40128/plumber/utils"
)


func Fetch(dataMap utils.RequestIncomingDataType,db *sql.DB) utils.RequestOutgoingDataType{
	rows,err:=db.Query("Select data from codeuploads where id=$1",dataMap.CodeId)
	if err!=nil{
		fmt.Println(err)
		log.Fatal("Error while quering data")
	}
	defer rows.Close()
	res:="Not Code Found 404";

	for rows.Next(){
		rows.Scan(&res)
	}
	if res=="Not Code Found 404"{
		rdata:= utils.RequestOutgoingDataType{
			Success: true,
			Error: true,
			Data: utils.IncomingDataTypes{},
		}
		return rdata;
	}
	var fdata utils.IncomingDataTypes;
	if err:=json.Unmarshal([]byte(res),&fdata); err !=nil{
		log.Fatal("Error during unmarshaling sql data")
	}
	rdata:= utils.RequestOutgoingDataType{
		Success: true,
		Error: false,
		Data: fdata,
	}
	return rdata;
}