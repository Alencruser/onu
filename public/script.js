function launchCustom() {
    socket.emit('group size');
}
socket.on('group size',(size,room)=>{
    if(size > 1){
        let form = document.createElement('form');
        form.action = "/room/"+room;
        form.method = 'POST';
        let input = document.createElement('input');
        input.name="groupSize";
        input.value = size;
        form.append(input);
        document.body.append(form);
        form.submit(); 
    }
})