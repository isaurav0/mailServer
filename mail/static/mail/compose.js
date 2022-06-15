var sendButton = document.getElementById("compose-button")


sendButton.addEventListener("click", function (e) {
    e.preventDefault()
    var from = document.getElementById("compose-from").value
    var recipients = document.getElementById("compose-recipients").value
    var subject = document.getElementById("compose-subject").value
    var body = document.getElementById("compose-body").value

    console.log("from: ", from)
    console.log("recipients: ", recipients)
    console.log("subject: ", subject)
    console.log("body: ", body)

    headers = {
        'Content-Type': 'application/json'
    }

    // axios.post("/email",JSON.stringify({recipients, subject, body}), headers)
    //     .then(res =>{
    //         if(res.status>199 && res.status<300)
    //             document.querySelector('#sent').click()
    //     })
    //     .catch(error=>console.log(error))

    fetch('/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients, subject, body }),
    })
        .then(res => {
            if (res.status > 199 && res.status < 300)
                document.querySelector('#sent').click()
        })
        .catch(error => console.log(error))
})