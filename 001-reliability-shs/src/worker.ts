function runWorker(){
    console.log("doing task...")

    if(Math.random() < 0.1){
        throw Error("boom 💥")
    }
}

runWorker()