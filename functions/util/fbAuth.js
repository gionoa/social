// MIDDLEWARE: check if user is signed in (authenticated)
const { admin, db } = require('./admin')

module.exports = (req, res, next) => {
	let idToken;
	if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
		idToken = req.headers.authorization.split('Bearer ')[1];
	} else {
		console.error('No token found')
		return res.status(403).json({ error: 'Unauthorized'});
	}

  admin
    .auth()
    .verifyIdToken(idToken)
		// attach token to req.user
		.then(decodedToken => {
			req.user = decodedToken;
			return db
				.collection('users')
				.where('userId', '==', req.user.uid)
				.limit(1)
				.get();
		})
		// attach user handle and profile picture to req.user
		.then(data => {
			req.user.handle = data.docs[0].data().handle;
			req.user.imageUrl = data.docs[0].data().imageUrl;
			return next();
		})
		.catch(err => {
			console.error('Error while verifying token ', err);
			return res.status(403).json(err);
		})
}