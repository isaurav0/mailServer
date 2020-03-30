document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(id) {
   
  // Show compose view and hide other views
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#compose-view').style.display = 'block';
   
   document.querySelector('#compose-body').value = '';

  if(!id){  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-recipients').focus();
    document.querySelector('#compose-subject').value = '';
  }
  else{
    axios.get("/emails/"+id)
      .then(res=>{
        console.log(res)
        document.querySelector('#compose-recipients').value = res.data.sender;
        document.querySelector('#compose-body').value = "\n\n\n\n\n\n\n\n\n\n\n----------------------------------------------------------------------------\n";
        document.querySelector('#compose-body').value += 'On ' + res.data.timestamp + ', ' + res.data.sender + ' wrote: \n' + res.data.body ;
        document.querySelector('#compose-body').focus();
        resetCursor(document.querySelector('#compose-body'));
        
        if(!res.data.subject.includes("Re:"))
          document.querySelector('#compose-subject').value = "Re: " + res.data.subject;
        else
          document.querySelector('#compose-subject').value = res.data.subject;        
      })
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  //empty view box first
  var box = document.getElementById("emails-view");
  box.innerHTML = ""
  box.style.backgroundColor = "white"

  // Show the mailbox name
  var title = document.createElement("h3")
  title.innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  
  var table = document.createElement("table")
  table.className = "table table-hover mytable"
  table.innerHTML = ""

  box.appendChild(title)
  box.appendChild(table)
  

  //show mailbox content
  axios.get("/emails/"+mailbox)
    .then(res => {
      for(i=0; i<res.data.length ; i++){
        var row = table.insertRow(i)
        row.className = "clickable-row"
        row.id = res.data[i].id
        row.addEventListener("click", (e) => {
          loadMessage(e.target.parentElement.id, mailbox);
        })

        var cell1 = row.insertCell(0)
        var cell2 = row.insertCell(1)
        var cell3 = row.insertCell(2)
        cell1.innerHTML = res.data[i].sender
        cell1.width = "20%"
        cell3.width = "18%"
        cell2.width = "40%"
        cell2.innerHTML = res.data[i].subject + " - " + res.data[i].body
        cell3.innerHTML = res.data[i].timestamp

        if(mailbox == 'sent'){
          cell1.innerHTML = "To: &nbsp" + res.data[i].recipients
          cell2.width = "50%"
        }
          

        if( res.data[i].body.length > 400 )
          cell2.innerHTML = res.data[i].subject + " - " + res.data[i].body.slice(0, 100) + "&nbsp...."
        if(res.data[i].read == true){
          cell1.style.backgroundColor = "rgb(233,233,233)"
          cell1.style.fontWeight = "normal"
          cell2.style.backgroundColor = "rgb(233,233,233)"
          cell2.style.fontWeight = "normal"
          cell3.style.backgroundColor = "rgb(233,233,233)"
          cell3.style.fontWeight = "normal"
        }
        else{
          cell1.style.backgroundColor = "white"
          cell1.style.fontWeight = "bold"
          cell2.style.backgroundColor = "white"
          cell2.style.fontWeight = "bold"
          cell3.style.backgroundColor = "white"
          cell3.style.fontWeight = "bold"
        }

      }
    })

}

function loadMessage(id, mailbox){
  axios.get("/emails/"+id)
    .then(res=>{
      if( !res.data.read )
        axios.put("/emails/"+id,{read: true})
        // axios.put("/emails/"+id,{read: false})

      var box = document.getElementById("emails-view")
      box.innerHTML = ""
      box.style.backgroundColor = "rgb(244,244,244)"
      box.style.padding = "10px"

      var subject = document.createElement("h5")
      subject.className = "email-detail"
      subject.innerHTML = "Subject&nbsp : &nbsp&nbsp &nbsp " + "<b>" + res.data.subject + "</b>"

      var sender = document.createElement('h5')
      sender.className = "email-detail"
      sender.innerHTML = "Sender&nbsp : &nbsp&nbsp &nbsp" + "<b>" + res.data.sender + "</b>"

      var date = document.createElement("h5")
      date.className = "email-detail"
      date.innerHTML = "Date &nbsp&nbsp  &nbsp : &nbsp&nbsp &nbsp " + "<b>" + res.data.timestamp + "</b>"

      var body = document.createElement("div")
      body.className = "email-detail"
      body.style.fontSize = "20px"
      body.innerHTML = res.data.body.replace(/\n/g, '<br>')

      box.appendChild(subject)
      box.appendChild(sender)
      box.appendChild(date)
      box.appendChild(body)

      //api doesnt support archive for sent 
      if(mailbox!="sent"){
        var archiveButton = document.createElement("button")
        archiveButton.className = "btn btn-sm btn-outline-secondary email-buttons"
        archiveButton.id = res.data.id
        archiveButton.archived = res.data.archived
        archiveButton.addEventListener("click", (e)=> archive(e.target.id, e.target.archived))
        if( !res.data.archived )
          archiveButton.innerHTML = "&nbsp Archive &nbsp"
        else
          archiveButton.innerHTML = "&nbsp Unarchive &nbsp"

        var replyButton = document.createElement("button")
        replyButton.innerHTML = "&nbsp &nbsp Reply &nbsp&nbsp "
        replyButton.className = "btn btn-sm btn-outline-secondary email-buttons"
        replyButton.id = res.data.id
        replyButton.addEventListener("click", (e)=> compose_email(e.target.id))
        box.appendChild(archiveButton)
        box.appendChild(replyButton)
      }
      
    })
}

//toggle archive and unarchive
function archive(id, state){
  axios.put("/emails/"+id, { archived: !state})
    .then(res=>{
      load_mailbox("inbox")
    })
}


//keep cursor at beginning
function resetCursor(txtElement) { 
  if (txtElement.setSelectionRange) { 
      txtElement.focus(); 
      txtElement.setSelectionRange(0, 0); 
  } else if (txtElement.createTextRange) { 
      var range = txtElement.createTextRange();  
      range.moveStart('character', 0); 
      range.select(); 
  } 
}