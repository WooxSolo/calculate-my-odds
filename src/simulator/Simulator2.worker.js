
onmessage = function (event) {
    console.log("worker received", event.data);
    
    postMessage({
        data: 73
    });
};
  