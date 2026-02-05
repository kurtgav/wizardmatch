package handler

type appError struct {
	message string
	status  int
}

func (e appError) Error() string {
	return e.message
}
