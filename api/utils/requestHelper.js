// function checks if post request has required fields
exports.validateRequiredPostFields = (requirements, fields) => {
    for (let fieldName in requirements) {
        for (let requirement in requirements[fieldName]) {
            switch (requirement) {
                case 'required':
                    if (fieldName.required === true && !(fieldName in fields)) {
                        return {
                            error: `${fieldName} is not set`
                        }
                    }
                    break;
                case 'notEmpty':
                    if (fieldName.notEmpty === true && (!fields[fieldName] || fields[fieldName].length < 1)) {
                        return {
                            error: `${fieldName} must not be empty`
                        }
                    }
                    break;
                case 'type':
                    if (requirements[fieldName].type === 'array') {
                        if (!Array.isArray(fields[fieldName]) || fields[fieldName].length < 2) {
                            return {
                                error: `${fieldName} must be array with length of at least 2`
                            }
                        }
                    } else if (requirements[fieldName].type === 'number') {
                        if (typeof fields[fieldName] !== "number") {
                            return {
                                error: `${fieldName} must be a number`
                            }
                        }
                    } else {
                        return {
                            error: "Server Error: unknown type required"
                        }
                    }
                    break;
                case 'maxLength':
                    if (fields[fieldName].length > requirements.requirement.fieldName) {
                        return {
                            error: `${fieldName} must not exceed ${requirements.requirement.fieldName} characters`
                        }
                    }
                    break;
            }
        }
    }
    // requirements is object with param as key and object of requirements as value (ie required, notEmpty)
    return 'success'
}

exports.handleError = (res, error) => {
    if (error.error) {
        res.status(400).json(error)
        return
    }
}