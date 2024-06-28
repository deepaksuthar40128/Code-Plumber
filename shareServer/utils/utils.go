package utils

type IncomingRawDataType struct{
	Type	string		`json:"type"`
	Id		string 		`json:"id"`
	Data	interface{}	`json:"data"`
}

type IncomingDataTypes struct{
	Code 		string		`json:"code"`
	Language 	string		`json:"language"`
	Message 	string		`json:"message"`
}

type RequestIncomingDataType struct{
	CodeId		string		`json:"codeId"`
}

type OutgoingDataType struct{
	CodeId		int64 		`json:"codeId"`
	Error		bool		`json:"error"`
	Success		bool 		`json:"success"`
}

type RequestOutgoingDataType struct{
	Success		bool 		`json:"success"`
	Error		bool 		`json:"error"`
	Data 		IncomingDataTypes	`json:"data"`
}