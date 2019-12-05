class SearchBySender {
	constructor(xmlNode) {
		this.uuid = xmlNode.getElementsByTagName("uuid")[0].childNodes[0].nodeValue;
		this.query = xmlNode.getElementsByTagName("Query")[0].childNodes[0].nodeValue;
		this.resultBatches = new Map();
		
		var resultsBySender = xmlNode.getElementsByTagName("ResultsBySender")[0];
		var resultsFromSenders = resultsBySender.getElementsByTagName("ResultsFromSender");
		var i;
		for (i = 0; i < resultsFromSenders.length; i++) {
			var results = new ResultsBySender(resultsFromSenders[i]);
			this.resultBatches.set(results.sender, results);
		}
	}
}

class SearchByFile {
	constructor(xmlNode) {
		this.uuid = xmlNode.getElementsByTagName("uuid")[0].childNodes[0].nodeValue;
		this.query = xmlNode.getElementsByTagName("Query")[0].childNodes[0].nodeValue;
		this.resultBatches = new Map();
		
		var resultsByFile = xmlNode.getElementsByTagName("ResultsByFile")[0];
		var resultsForFile = resultsByFile.getElementsByTagName("ResultsForFile");
		var i;
		for (i = 0; i < resultsForFile.length; i++) {
			var results = new ResultsByFile(resultsForFile[i]);
			this.resultBatches.set(results.infoHash, results);
		}
	}
}

class ResultsBySender {
	constructor(xmlNode) {
		this.sender = xmlNode.getElementsByTagName("Sender")[0].childNodes[0].nodeValue;
		this.results = [];
		var resultNodes = xmlNode.getElementsByTagName("Result");
		var i;
		for (i = 0 ; i < resultNodes.length; i ++) {
			var result = new ResultBySender(resultNodes[i]);
			this.results.push(result);
		}
	}
}

class ResultsByFile {
	constructor(xmlNode) {
		this.name = xmlNode.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
		this.infoHash = xmlNode.getElementsByTagName("InfoHash")[0].childNodes[0].nodeValue;
		this.size = xmlNode.getElementsByTagName("Size")[0].childNodes[0].nodeValue;
		this.downloading = xmlNode.getElementsByTagName("Downloading")[0].childNodes[0].nodeValue;
		this.results = [];
		var resultNodes = xmlNode.getElementsByTagName("Result");
		var i;
		for (i = 0; i < resultNodes.length; i++) {
			var result = new ResultByFile(resultNodes[i]);
			this.results.push(result);
		}
	}
}

class ResultBySender {
	constructor(xmlNode) {
		this.name = xmlNode.getElementsByTagName("Name")[0].childNodes[0].nodeValue;
		this.size = xmlNode.getElementsByTagName("Size")[0].childNodes[0].nodeValue;
		this.infoHash = xmlNode.getElementsByTagName("InfoHash")[0].childNodes[0].nodeValue;
		this.downloading = xmlNode.getElementsByTagName("Downloading")[0].childNodes[0].nodeValue;
	}
}

class ResultByFile {
	constructor(xmlNode) {
		this.sender = xmlNode.getElementsByTagName("Sender")[0].childNodes[0].nodeValue;
	}
}

var searches = new Map();

var uuid = null;
var sender = null;
var lastXML = null;
var infoHash = null;

function download(resultInfoHash) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var resultSpan = document.getElementById("download-"+resultInfoHash);
			resultSpan.innerHTML = "Downloading";
		}
	}
	xmlhttp.open("POST", "/MuWire/Download", true);
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlhttp.send(encodeURI("action=start&infoHash="+resultInfoHash+"&uuid="+uuid));
}

function updateSender(senderName) {
	sender = senderName;
	
	var resultsFromSpan = document.getElementById("resultsFrom");
	resultsFromSpan.innerHTML = "Results From "+sender;
	
	var resultsDiv = document.getElementById("bottomTable");
	var table = "<table><thead><tr><th>Name</th><th>Size</th><th>Download</th></tr></thead><tbody>"
	var x = searches.get(uuid)
	x = x.resultBatches.get(sender).results;
	var i;
	for (i = 0; i < x.length; i++) {
		table += "<tr>";
		table += "<td>";
		table += x[i].name;
		table += "</td>";
		table += "<td>";
		table += x[i].size;
		table += "</td>";
		table += "<td>";
		if (x[i].downloading == "false") {
			table += "<span id='download-"+ x[i].infoHash+"'><a href='#' onclick='window.download(\"" + x[i].infoHash + "\");return false;'>Download</a></span>";
		} else {
			table += "Downloading";
		}
		table += "</td>";
		table += "</tr>";
	}
	table += "</tbody></table>";
	if (x.length > 0)
		resultsDiv.innerHTML = table;
}

function updateFile(fileInfoHash) {
	infoHash = fileInfoHash;
	
	var searchResults = searches.get(uuid).resultBatches.get(infoHash);
	
	var resultsFromSpan = document.getElementById("resultsFrom");
	resultsFromSpan.innerHTML = "Results For "+searchResults.name;
	
	var resultsDiv = document.getElementById("bottomTable");
	var table = "<table><thead><tr><th>Sender</th></tr></thead><tbody>";
	var i;
	for (i = 0; i < searchResults.results.length; i++) {
		table += "<tr>";
		table += "<td>";
		table += searchResults.results[i].sender;
		table += "</td>";
		table += "</tr>";
	}
	table += "</tbody></table>";
	if (searchResults.results.length > 0)
		resultsDiv.innerHTML = table;
}			

function updateUUIDBySender(resultUUID) {
	uuid = resultUUID;
	
	var currentSearchSpan = document.getElementById("currentSearch");
	currentSearchSpan.innerHTML = searches.get(uuid).query + " Results";
	
	var sendersDiv = document.getElementById("topTable");
	var table = "<table><thead><tr><th>Sender</th></tr></thead><tbody>";
	var x = searches.get(uuid).resultBatches;
	for (var [senderName, ignored] of x) {
		table += "<tr><td><a href='#' onclick='updateSender(\""+senderName+"\");return false;'>"
		table += senderName;
		table += "</a></td></tr>";
	}
	table += "</tbody></table>";
	if (x.size > 0)
		sendersDiv.innerHTML = table;
	if (sender != null)
		updateSender(sender);
}

function updateUUIDByFile(resultUUID) {
	uuid = resultUUID;
	
	var currentSearchSpan = document.getElementById("currentSearch");
	currentSearchSpan.innerHTML = searches.get(uuid).query + " Results";
	
	var topTableDiv = document.getElementById("topTable");
	var table = "<table><thead><tr><th>Name</th><th>Size</th><th>Download</th></tr></thead><tbody>";
	var x = searches.get(uuid).resultBatches;
	for (var [fileInfoHash, file] of x) {
		table += "<tr><td><a href='#' onclick='updateFile(\""+fileInfoHash+"\");return false;'>";
		table += file.name;
		table += "</a></td>";
		table += "<td>";
		table += file.size;
		table += "</td>";
		table += "<td>";
		if (file.downloading == "false") 
			table += "<span id='download-"+fileInfoHash+"'><a href='#' onclick='window.download(\""+fileInfoHash+"\"); return false;'>Download</a></span>";
		else
			table += "Downloading";
		table += "</td></tr>";
	}
	table += "</tbody></table>";
	if (x.size > 0) 
		topTableDiv.innerHTML = table;
	if (infoHash != null)
		updateFile(infoHash);
}

function refreshGroupBySender() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var xmlDoc = this.responseXML;
			lastXML = xmlDoc;
			searches.clear();
			var i;
			var x = xmlDoc.getElementsByTagName("Search");
			for (i = 0; i < x.length; i++) {
				var search = new SearchBySender(x[i]);
				searches.set(search.uuid, search);
			}
			
			var table = "<table><thead><tr><th>Search</th><th>Senders</th><th>Results</th></tr></thead><tbody>";
			var activeSearchesDiv = document.getElementById("activeSearches");
			for (var [resultsUUID, search] of searches) {
				table += "<tr><td><a href='#' onclick='updateUUIDBySender(\"" + resultsUUID+ "\");return false;'>"
				table += search.query;
				table += "</a></td>";
				table += "<td>"
				table += search.resultBatches.size;
				table += "</td>";
				
				var map = new Map();
				for ( var [sender, results] of search.resultBatches ) {
					results.results.forEach(result => map.set(result.infoHash, 1));
				}
				table += "<td>";
				table += map.size;
				table += "</td>"
				table += "</tr>"
			}
			table += "</tbody></table>"
			if (x.length > 0) 
				activeSearchesDiv.innerHTML = table;
			if (uuid != null)
				updateUUIDBySender(uuid);
			
		}
	}
	xmlhttp.open("GET", "/MuWire/Search?section=groupBySender", true);
	xmlhttp.send();
}

function refreshGroupByFile() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var xmlDoc = this.responseXML;
			lastXML = xmlDoc;
			searches.clear();
			var i;
			var x = xmlDoc.getElementsByTagName("Search");
			for (i = 0; i < x.length; i++) {
				var search = new SearchByFile(x[i]);
				searches.set(search.uuid, search);
			}
			
			var table = "<table><thead><tr><th>Search</th><th>Senders</th><th>Results</th></tr></thead><tbody>";
			var activeSearchesDiv = document.getElementById("activeSearches");
			for (var [resultsUUID, search] of searches) {
				table += "<tr><td><a href='#' onclick='updateUUIDByFile(\"" + resultsUUID+ "\");return false;'>"
				table += search.query;
				table += "</a></td>";
				
				var map = new Map()
				for (var [fileInfoHash, result] of search.resultBatches) {
					result.results.forEach(sender => map.set(sender.sender, 1));
				}
				table += "<td>"
				table += map.size;
				table += "</td>";
				
				
				table += "<td>";
				table += search.resultBatches.size;
				table += "</td>"
				table += "</tr>"
			}
			table += "</tbody></table>"
			if (x.length > 0) 
				activeSearchesDiv.innerHTML = table;
			if (uuid != null)
				updateUUIDByFile(uuid);
			
		}
	}
	xmlhttp.open("GET", "/MuWire/Search?section=groupByFile", true);
	xmlhttp.send();
}

function initGroupBySender() {
	setInterval(refreshGroupBySender, 3000);
	setTimeout(refreshGroupBySender, 1);
}

function initGroupByFile() {
	setInterval(refreshGroupByFile, 3000);
	setTimeout(refreshGroupByFile, 1);
}