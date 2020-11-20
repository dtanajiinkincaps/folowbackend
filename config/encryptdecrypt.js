const  crypto=require('crypto');
const jwt = require('jsonwebtoken');


function encryptData(data,iv) {
 let cipher = crypto.createCipheriv(process.env.algorithm||"aes-256-cbc", Buffer.from(process.env.encryption_key||"edb586b0cf329ed30ace437a1d47e881"), iv);
 let encrypted = cipher.update(data);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return encrypted.toString('hex');
}
function encryptDataStringSalt(data,iv)
{
	iv = Buffer.from(process.env.salt_string||"c95f77651f815f3d70f3281065c5e5c5", 'hex');
	let cipher = crypto.createCipheriv(process.env.algorithm||"aes-256-cbc", Buffer.from(process.env.encryption_key||"edb586b0cf329ed30ace437a1d47e881"), iv);
	let encrypted = cipher.update(data);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return encrypted.toString('hex');
}

function decryptData(data,iv) {
	// console.log("encrypted data",data);
	// console.log("salt_string",iv);z
	iv = Buffer.from(iv||"c95f77651f815f3d70f3281065c5e5c5", 'hex');
	let encryptedText = Buffer.from(data, 'hex');
	let decipher = crypto.createDecipheriv(process.env.algorithm||"aes-256-cbc", Buffer.from(process.env.encryption_key||"edb586b0cf329ed30ace437a1d47e881"), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}

function encryptPassword(data)
{
	var salt=crypto.randomBytes(16);
	var salt_string=salt.toString('hex');
	var hash=crypto.pbkdf2Sync(data, salt_string, 1000, 64, "sha512").toString('hex');
	return {password:hash,salt:salt,salt_string:salt_string};
}
function encryptMD5Password(data)
{
	const crypto = require('crypto');
	const hash = crypto.createHash('md5');

	hash.update(data);
	return hash.digest('hex');
}
function encryptPasswordWithSalt(newpassword,salt)
{
	var hash=crypto.pbkdf2Sync(newpassword,salt,1000,64,"sha512").toString("hex");
	return hash;
}

function generateToken(data)
{
	try
	{
		// console.log(data);
		var token = jwt.sign(data, process.env.encryption_key||"edb586b0cf329ed30ace437a1d47e881");
		return {"status":"success","msg":token,"error":""};
	}
	catch(e)
	{
		// console,log(e);
		return {"status":"unsuccess","msg":"","error":["error::"+e.message]};
	}
}

module.exports ={
	encrypt:encryptData,
	decrypt:decryptData,
	password:encryptPassword,
	passwordmd5:encryptMD5Password,
	generateToken:generateToken,
	encryptWithStringSalt:encryptDataStringSalt,
	passwordWithSaltString:encryptPasswordWithSalt
}