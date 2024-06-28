package utils

import (
	"errors"
	"time"
)

type StoreItem struct {
	CodeId int64
	Time   time.Time
}

type Node struct {
	value StoreItem
	next  *Node
}

type Queue struct {
	Front *Node
	Rear  *Node
}

func NewQueue() *Queue {
	return &Queue{
		Front: nil,
		Rear:  nil,
	}
}

func (q *Queue) Enqueue(value StoreItem) {
	n := &Node{
		value: value,
		next:  nil,
	}
	if q.Rear == nil {
		q.Front = n
		q.Rear = n
		return
	}
	q.Rear.next = n
	q.Rear = n
}

func (q *Queue) Dequeue() (StoreItem, error) {
	if q.Front == nil {
		return StoreItem{}, errors.New("Queue is already Empty")
	}
	val := q.Front.value
	q.Front = q.Front.next
	if q.Front == nil {
		q.Rear = nil
	}
	return val, nil
}

func (q *Queue) Top() (StoreItem, error) {
	if q.Front == nil {
		return StoreItem{}, errors.New("Queue is Empty")
	}
	return q.Front.value, nil
}
