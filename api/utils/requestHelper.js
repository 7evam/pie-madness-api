// function checks if post request has required fields
exports.validateRequiredPostFields = (requirements, fields) => {
    for(let fieldName in requirements){
        for(let requirement in requirements[fieldName]){
            switch(requirement){
                case 'required':
                    if(!(fieldName in fields)){
                        return {
                            error: `${fieldName} is not set`
                        }
                    }
                    break;
                case 'notEmpty':
                    if(!fields[fieldName] || fields[fieldName].length < 1){
                        return {
                            error: `${fieldName} must not be empty`
                        }
                    }
                    break;
                case 'maxLength':
                    if(fields[fieldName].length > requirements.requirement.fieldName){
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
    if(error.error){
        res.status(400).json(error)
        return
    }
}