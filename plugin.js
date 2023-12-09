module.exports = {
    construct: function (config) {

        console.log("plugin construct", config);

    },
    $signal: async function (signal, data) {

        console.log(">>>", signal, data);

        return new Promise(function (resolve, reject) {

            setInterval(resolve, 100);

        });

    }

}