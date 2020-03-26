const formatMiddlewareValidation = error => {
	return {
		validationError: {
			original: {
				...error._original,
			},
			details: {
				message: error.details[0].message,
				key: error.details[0].context.key,
				value: error.details[0].context.value,
			},
		},
	};
};

const formatMongooseError = error => {
    return {
        error: {
            message: error.message,
            type: error.name
        }
    }
};

module.exports.formatMiddlewareValidation = formatMiddlewareValidation;
module.exports.formatMongooseError = formatMongooseError;