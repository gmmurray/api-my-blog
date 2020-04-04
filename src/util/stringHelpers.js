const getLastSegmentOfUrl = url => {
	url = url.replace(/\/$/, '');
	return url.substring(url.lastIndexOf('/') + 1);
};

module.exports = {
	getLastSegmentOfUrl,
};
