export function pickColor(){
    let colors = ["aquamarine","steelblue","cadetblue","darkred","crimson","chocolate","darkcyan","darkslateblue"];
    return colors[(Math.floor(Math.random() * colors.length))]; 
}