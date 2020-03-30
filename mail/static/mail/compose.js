var sendButton = document.getElementById("compose-button")


sendButton.addEventListener("click", function(e){
    var from = document.getElementById("compose-from").value
    var recipients = document.getElementById("compose-recipients").value
    var subject = document.getElementById("compose-subject").value
    var body = document.getElementById("compose-body").value

    console.log("from: ",from)
    console.log("recipients: ", recipients)
    console.log("subject: ", subject)
    console.log("body: ", body)

    e.preventDefault()
    axios.post("/emails",JSON.stringify({recipients, subject, body}))
        .then(res =>{
            if(res.status>199 && res.status<300)
                document.querySelector('#sent').click()
        })
        .catch(error=>console.log(error))
})