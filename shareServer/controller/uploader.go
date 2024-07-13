package controller

import (
	"database/sql"
	"encoding/json"
	"log" 
	"time"

	"github.com/deepaksuthar40128/plumber/utils"
	_ "github.com/lib/pq"
)



func MakeConnection(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	return db, nil
}

func Upload(data utils.IncomingDataTypes, db *sql.DB, store *utils.Queue) utils.OutgoingDataType {
	jsonData, _ := json.Marshal(data)
	var rowId int64
	err := db.QueryRow("INSERT INTO codeuploads (data) values ($1) RETURNING id", jsonData).Scan(&rowId)
	if err != nil {
		log.Fatal("Error during insert", err)
	}
	store.Enqueue(utils.StoreItem{
		CodeId: rowId,
		Time: time.Now(),
	})
	rdata := utils.OutgoingDataType{
		CodeId:  rowId,
		Error:   false,
		Success: true,
	}
	return rdata
}


func Collactor(q*utils.Queue,db *sql.DB){ 
	go func () {
		for{ 
			for{ 
				tp,err:=q.Top();
				if err !=nil || (time.Since(tp.Time)<(10*60*time.Second)){
					break
				}
				if _,err:=q.Dequeue();err!=nil{
					log.Fatal("Something unconsistent")
				}
				if _,err:=db.Exec("Delete from codeuploads where id=$1",tp.CodeId);err!=nil{
					log.Fatal("Something Wrong during deleting")
				}
			}
			time.Sleep(30*time.Second)
		}
	}()
}