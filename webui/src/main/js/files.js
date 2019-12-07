
class Node {
	constructor(nodeId, parent, leaf, path, size, comment, revision) {
		this.nodeId = nodeId
		this.parent = parent
		this.leaf = leaf
		this.children = []
		this.path = path
		this.size = size
		this.comment = comment
		this.revision = revision
	}
	
	updateDiv() {
		var div = document.getElementById(this.nodeId)
		var unshareLink = "<a href='#' onclick='window.unshare(\"" + this.nodeId +"\");return false;'>Unshare</a>"
		var commentLink = "<span id='comment-link-"+this.nodeId+"'><a href='#' onclick='window.showCommentForm(\"" + this.nodeId + "\");return false;'>Comment</a></span>";
		if (this.leaf) {
			div.innerHTML = "<li>"+this.path+"<br/>"+ unshareLink + "   " + commentLink + "<div id='comment-" + this.nodeId+ "'></div></li>"
		} else {
			if (this.children.length == 0) {
				div.innerHTML = "<li><span><a href='#' onclick='window.expand(\"" + this.nodeId + "\");return false'>" + 
					this.path + "</a>   " + unshareLink + "</span>" + commentLink + "<div id='comment-" + this.nodeId + "'></div></li>"
			} else {
				var l = "<li><a href='#' onclick='window.collapse(\"" + this.nodeId + "\");return false;'>"+this.path+"</a>   " + unshareLink
				l += "  " + commentLink+"<div id='comment-" + this.nodeId + "'></div>"
				
				l += "<ul>"
				var i
				for (i = 0; i < this.children.length; i++) {
					l += "<li>"
					l += "<div id='" + this.children[i].nodeId+"'></div>"
					l += "</li>"
				}
				l += "</ul></li>"
				div.innerHTML = l
			}
		}
	}
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

// public method for decoding
decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = Base64._utf8_decode(output);

    return output;

},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}

}

function refreshStatus() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var xmlDoc = this.responseXML;
			
			var count = xmlDoc.getElementsByTagName("Count")[0].childNodes[0].nodeValue
			var countSpan = document.getElementById("count")
			countSpan.innerHTML = count
			
			var hashingSpan = document.getElementById("hashing")
			var hashing = xmlDoc.getElementsByTagName("Hashing")
			if (hashing != null && hashing.length == 1) {
				hashingSpan.innerHTML = "Hashing "+hashing[0].childNodes[0].nodeValue
			} else
				hashingSpan.innerHTML = "";
				
			var newRevision = xmlDoc.getElementsByTagName("Revision")[0].childNodes[0].nodeValue
			if (newRevision > treeRevision) {
				// TODO: update expanded nodes
				treeRevision = newRevision
			}
		}
	}
	xmlhttp.open("GET", "/MuWire/Files?section=status", true)
	xmlhttp.send();
}

var treeRevision = -1
var root = new Node("root",null,false,"Shared Files", -1, null, -1)
var nodesById = new Map()

function initFiles() {
	setInterval(refreshStatus, 3000)
	setTimeout(refreshStatus, 1)
	
	nodesById.set("root",root)
	root.updateDiv()
}

function encodedPathToRoot(node) {
	var pathElements = []
	var tmpNode = node
	while(tmpNode.parent != null) {
		pathElements.push(Base64.encode(tmpNode.path))
		tmpNode = tmpNode.parent
	}
	var reversedPath = []
	while(pathElements.length > 0)
		reversedPath.push(pathElements.pop())
	var encodedPath = reversedPath.join(",")
	return encodedPath	
}

function expand(nodeId) {
	var node = nodesById.get(nodeId)
	var encodedPath = encodedPathToRoot(node)	
	var xmlhttp = new XMLHttpRequest()
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var xmlDoc = this.responseXML
			var revision = xmlDoc.getElementsByTagName("Revision")[0].childNodes[0].nodeValue
			var fileElements = xmlDoc.getElementsByTagName("File")
			var i
			for (i = 0; i < fileElements.length; i++) {
				var fileName = fileElements[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue
				var size = fileElements[i].getElementsByTagName("Size")[0].childNodes[0].nodeValue
				var comment = fileElements[i].getElementsByTagName("Comment")
				if (comment != null && comment.length == 1)
					comment = comment[0].childNodes[0].nodeValue
				else
					comment = null
				
				var nodeId = node.nodeId + "_"+ Base64.encode(fileName)
				var newFileNode = new Node(nodeId, node, true, fileName, size, comment, revision)
				nodesById.set(nodeId, newFileNode)
				node.children.push(newFileNode)
			}
			
			var dirElements = xmlDoc.getElementsByTagName("Directory")
			for (i = 0; i < dirElements.length; i++) {
				var dirName = dirElements[i].childNodes[0].nodeValue
				var nodeId = node.nodeId + "_"+ Base64.encode(dirName)
				var newDirNode = new Node(nodeId, node, false, dirName, -1, null, revision)
				nodesById.set(nodeId, newDirNode)
				node.children.push(newDirNode)
			}
			
			node.updateDiv()
		    for (i = 0; i < node.children.length; i++) {
				node.children[i].updateDiv()
			}
		}
	}
	xmlhttp.open("GET", "/MuWire/Files?section=files&path="+encodedPath, true)
	xmlhttp.send()
}

function collapse(nodeId) {
	var node = nodesById.get(nodeId)
	node.children = []
	node.updateDiv()
}

function unshare(nodeId) {
	var node = nodesById.get(nodeId)
	var encodedPath = encodedPathToRoot(node)
	var xmlhttp = new XMLHttpRequest()
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var parent = node.parent
			collapse(parent.nodeId)
			expand(parent.nodeId)
		}
	}
	xmlhttp.open("POST", "/MuWire/Files", true)
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlhttp.send("action=unshare&path="+encodedPath)
}

function showCommentForm(nodeId) {
	var linkSpan = document.getElementById("comment-link-"+nodeId)
	linkSpan.innerHTML=""
	var commentDiv = document.getElementById("comment-"+nodeId)
	
	var node = nodesById.get(nodeId)
	var existingComment = node.comment == null ? "" : node.comment
	
	var textArea = "<textarea id='comment-text-" + nodeId + "'>"+existingComment+"</textarea>" 
	var saveCommentLink = "<a href='#' onclick='saveComment(\"" + nodeId + "\");return false;'>Save</a>"
	var cancelCommentLink = "<a href='#' onclick='cancelComment(\"" + nodeId + "\");return false;'>Cancel</a>"
	
	var html = textArea + "<br/>" + saveCommentLink + "  " + cancelCommentLink
	
	commentDiv.innerHTML = html
}

function cancelComment(nodeId) {
	var commentDiv = document.getElementById("comment-"+nodeId)
	commentDiv.innerHTML = ""
	
	var node = nodesById.get(nodeId)
	node.updateDiv()
}

function saveComment(nodeId) {
	var comment = document.getElementById("comment-text-"+nodeId).value
	var node = nodesById.get(nodeId)
	var encodedPath = encodedPathToRoot(node)
	var xmlhttp = new XMLHttpRequest()
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			cancelComment(nodeId)
			collapse(node.parent.nodeId)
			expand(node.parent.nodeId) // this can probably be done smarter
		}
	} 
	xmlhttp.open("POST", "/MuWire/Files", true)
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlhttp.send(encodeURI("action=comment&path="+encodedPath+ "&comment="+comment))
}