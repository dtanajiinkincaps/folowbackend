const datetime=require("node-datetime");

function getDateTime(format)
{
	// console.log("date conversion format ",format);
	try
	{
		if(format=="" || format==undefined)
			format='d/m/Y H:M:S';
		
		let dt=datetime.create();

		return (""+dt.format(format));
	}
	catch(e)
	{
		console.log(e);
		let dt=datetime.create();		
		return (""+dt.format(process.env.db_date_format));
	}
}
function convertDateTime(dateString,date_format)
{
	try
	{
		var dt=datetime.create(dateString);

		return ""+dt.format(date_format);
	}
	catch(e)
	{
		var dt=datetime.create();		
		return ""+dt.format(date_format);
	}
}
function getDefaultAgeDate(noOfDays)
{
	try 
	{
		var dt=datetime.create();

		dt.offsetInDays(noOfDays);

		if(dt.format("W")=="Saturday")
			dt.offsetInDays(2);
			
		if( dt.format("W")=="Sunday")
			dt.offsetInDays(1);
		
		return dt.format(config.db_date_format);
	}
	catch (error) 
	{
		console.log(error);
		var dt=datetime.create();
		return dt.format(config.db_date_format);;
	}
}
function dateCompare(oldDate,newDate="")
{
	try 
	{

		let dt=datetime.create(oldDate);
		let dt1=datetime.create();

		if(newDate!="")
			dt1=datetime.create(oldDate);

		return (dt1>=dt);
	} catch (error) 
	{
		console.log(error);
		return false;
	}
}
function dateOtpCompare(oldDate)
{
	try
	{
		let currentDate=datetime.create();
		let dt=datetime.create(oldDate);
		console.log("current date time:",currentDate.format("d/m/yy H:M:S"));
		console.log("otp sent date time:",dt.format("d/m/yy H:M:S"));
		const result=(currentDate.getTime()-dt.getTime())/60000;
		console.log("time difference is:",result);
		return result<=5;
	}
	catch(error)
	{
		console.log("Otp date compare error",error);
		return false;
	}
}
module.exports={
	get:getDateTime,
	convert:convertDateTime,
	compare:dateCompare,
	otpCompare:dateOtpCompare
};
// module.exports.get=getDateTime;
// module.exports.convert=convertDateTime;
// module.exports.nextDate=nextVerificationDate;
// module.exports.compareToday=dateCompareToToday;