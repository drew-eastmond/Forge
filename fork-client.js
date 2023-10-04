process.send(["forge://", { broadcast: "header" }, ["happy", "nappy"]]);
process.on("message", function (message) {

    console.log(message);

});