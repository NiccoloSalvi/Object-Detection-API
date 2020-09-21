AWS.config.credentials = new AWS.Credentials(aws_access_key_id, aws_secret_access_key); // credenziali servizi aws
AWS.config.region = "us-west-2";

var widthImage, heightImage;

function detectLabels(imageData) {
    var rekognition = new AWS.Rekognition(); // amazon rekognition
    var params = {
        Image: {
            Bytes: imageData // immagine passata con la proprietà Bytes deve essere base64-encoded
        },
        MaxLabels: 10, // numero massimo di elementi riconosciuti
        MinConfidence: 75 // minor valore accettabile, per il riconoscimento degli oggetti
    };
      
    rekognition.detectLabels(params, function(err, response) {
        if (err) {
            console.log(err, err.stack); // nel caso di errore
        } else {
            createCanvas();
            response.Labels.forEach(label => {
                console.log("Label: " + label.Name); // nome dell'oggetto riconosciuto
                console.log("Confidence: " + label.Confidence); // confidenza del riconoscimento
                label.Instances.forEach(instance => {
                    let box = instance.BoundingBox;
                    drawRect(instance.BoundingBox, label.Name);
                    /* console.log("Bounding box:");
                    console.log("Top: " + box.Top);
                    console.log("Left: " + box.Left);
                    console.log("Width: " + box.Width);
                    console.log("Height: " + box.Height); */
                });
                /* console.log("Parents:");
                label.Parents.forEach(parent => {
                    console.log(parent.Name);
                }); */
                console.log("");
            });
        }
    });
}

function drawRect(b, name) { // funzione per disegnare il rettangolo per ciascun oggetto riconosciuto
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.lineWidth = "2"; // spessore della linea del rettangolo
    ctx.strokeStyle = "black"; // colore della linea del rettangolo
    ctx.rect(b.Left * widthImage, b.Top * heightImage, b.Width * widthImage, b.Height * heightImage); // disegno del rettangolo
    ctx.font = "20px Arial"; // font del testo
    ctx.fillText(name, b.Left * widthImage, b.Top * heightImage - 5); // nome dell'oggetto e sua posizione
    ctx.stroke();
}
    
// loads selected image and unencodes image bytes for Rekognition API
function ProcessImage() {
    if (document.getElementById("myCanvas") != null)
        document.getElementById("myCanvas").remove();
    var control = document.getElementById("fileToUpload"); // file caricato
    var file = control.files[0];

    // caricata base64 encoded image 
    var reader = new FileReader();
    reader.onload = (function() {
        return function (e) {
            var image = null;
            var jpg = true;

            try {
                image = atob(e.target.result.split("data:image/jpeg;base64,")[1]);
            } catch (e) {
                jpg = false;
            }
            if (!jpg) {
                try {
                    image = atob(e.target.result.split("data:image/png;base64,")[1]);
                } catch (e) {
                    alert("Not an image file Rekognition can process");
                    return;
                }
            }

            // unencode image bytes for Rekognition DetectFaces API 
            var length = image.length;
            imageBytes = new ArrayBuffer(length);
            var ua = new Uint8Array(imageBytes);
            for (var i = 0; i < length; i++) {
                ua[i] = image.charCodeAt(i);
            }
            
            detectLabels(imageBytes); // rekognition
        }
    })(file);
    reader.readAsDataURL(file);
}

function createCanvas() {
    canvas = document.createElement("canvas");
    canvas.setAttribute("id", "myCanvas");

    pathSplitted = document.getElementById("fileToUpload").files[0].name.split("-");
    widthImage = pathSplitted[0];
    heightImage = pathSplitted[1];

    canvas.style.background = "url('img/" + document.getElementById("fileToUpload").files[0].name + "')";
    canvas.style.backgroundRepeat = "no-repeat";
    canvas.style.border = "2px solid black";
    canvas.style.width = widthImage + "px";
    canvas.style.height = heightImage + "px";
    canvas.width = widthImage;
    canvas.height = heightImage;
    canvas.style.position = "relative";

    document.getElementById("out").appendChild(canvas);
}