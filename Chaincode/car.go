package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"time"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Car struct {
	CarID  string `json:"ID"`
	Model  string `json:"model"`
	Owner  string `json:"owner"`
	Status string `json:"status"`
}

// CreateCar funtion will create a Car into Blockchain
func (s *SmartContract) CreateCar(ctx contractapi.TransactionContextInterface, id string, model string, owner string) error {

	err := ctx.GetClientIdentity().AssertAttributeValue("abac.manufacturer", "true")

	if err != nil {
		return fmt.Errorf("Submitting client not authorized to create Car, does not have abac.manufacturer role")
	}

	exists, err := s.CarExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the car is %s already exist", id)
	}

	car := Car{
		CarID:  id,
		Model:  model,
		Owner:  owner,
		Status: "Created",
	}

	carJSON, err := json.Marshal(car)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, carJSON)
}

// QueryCar returns the car stored in the world state with given id
func (s *SmartContract) QueryCar(ctx contractapi.TransactionContextInterface, id string) (*Car, error) {
	carJSON, err := ctx.GetStub().GetState(id)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %v", err.Error())
	}

	if carJSON == nil {
		return nil, fmt.Errorf("The car %s does not exist", id)
	}

	var car Car
	err = json.Unmarshal(carJSON, &car)

	if err != nil {
		return nil, err
	}

	return &car, nil
}

// QueryAllCars returns all cars found in world state
func (s *SmartContract) QueryAllCars(ctx contractapi.TransactionContextInterface) ([]*Car, error) {

	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var cars []*Car

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		var car Car
		err = json.Unmarshal(queryResponse.Value, &car)
		if err != nil {
			return nil, err
		}
		cars = append(cars, &car)
	}

	return cars, nil
}

// Deliver the Car
func (s *SmartContract) DeliverCar(ctx contractapi.TransactionContextInterface, id string, newOwner string) error {

	car, err := s.QueryCar(ctx, id)

	if err != nil {
		return err
	}

	car.Owner = newOwner
	car.Status = "READY_FOR_SALE"

	carJSON, err := json.Marshal(car)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, carJSON)
}

// Sell the Car
func (s *SmartContract) SellCar(ctx contractapi.TransactionContextInterface, id string, newOwner string) error {

	err := ctx.GetClientIdentity().AssertAttributeValue("abac.dealer", "true")

	if err != nil {
		return fmt.Errorf("submitting client not authorized to sell the Car, does not have abac.dealer role")
	}
	car, err := s.QueryCar(ctx, id)

	if err != nil {
		return err
	}

	car.Owner = newOwner
	car.Status = "SOLD"

	carJSON, err := json.Marshal(car)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, carJSON)
}

// CarExists returns true when asset with given ID exists in world state
func (s *SmartContract) CarExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {

	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return assetJSON != nil, nil
}

// Get History of the Car
func (s *SmartContract) GetHistoryForAsset(ctx contractapi.TransactionContextInterface, id string) (string, error) {

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return "", fmt.Errorf(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "", fmt.Errorf(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	return string(buffer.Bytes()), nil
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create car chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting car chaincode: %s", err.Error())
	}
}
