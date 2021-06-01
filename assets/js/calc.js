var endPointArray = [];
var loopCount = 0;
var connectionId = -1;
var draggedElementId = "";
var droppedElementId = "";

$(document).ready(function () {
    $("#addEndpoint").click(function () {
        var newPos = findWhiteSpaceOnStage();
        newPosX = newPos.split("::")[0];
        newPosY = newPos.split("::")[1];

        var node = {
            id: newGuid(),
            xpos: `${newPosX}px`,
            ypos: `${newPosY}px`,
            productName: 'Jaipur',
            subProductName: 'Anything',
            icon: 'endpoint',
            attachedEndPoints: [],
            connectionLineId: []
        };
        AddNode(node);
    });

    $(".line-delete").click(function () {
        var conId = $(this).attr('data-conid');

         for (var i = 0; i < endPointArray.length; i++) {
            if (endPointArray[i].connectionLineId.includes(conId)) {
                const index = endPointArray[i].connectionLineId.indexOf(conId);
                if (index > -1) {
                    endPointArray[i].connectionLineId.splice(index, 1);
                }
            }
         }

        var svgId = conId.replace("line", "svg");
        $("#" + svgId).remove();
        $('.line-delete').hide();
        alert("Connection deleted successfully");
    });
});

function AddNode(node) {
    var nodeHtml = `<div id="node_${node.id}" title="${node.productName}" style="left:${node.xpos};top:${node.ypos};z-index:300" class="drag circle skip-delete">
                        <div id="nodedelete_${node.id}" class="endpoint-delete skip-delete"></div> 
                        <div id="nodecircle_${node.id}" title="${node.productName}" class="circle nodecircle skip-delete">
                            <div id="nodecircleinfo_${node.id}" title="${node.productName}" class="iconclassname icon global skip-delete ${node.icon}">
                            </div>
                            <text class="skip-delete" title="${node.productName}">${node.productName}</text>
                        </div>
                    </div>`;
    $("#network_div").append(nodeHtml);

    $("#network_div").find(`#node_${node.id}`).draggable({
        handle: ".circle",
        containment: "#container_div",
        drag: function () {
            checkIfLineToBeDrawFromPToP($(this).attr("id"));
        }
    });

    $("#network_div").find(`#node_${node.id}`).droppable({
        drop: function () {
            dropEvent($(this).attr("id"));
        }
    });

    $("#network_div").find(`#nodecircleinfo_${node.id}`).draggable({
        revert: true,
        containment: "#container_div",
        start: function (e) {
            var svgNS = "http://www.w3.org/2000/svg";
            var svgNew = document.createElementNS(svgNS, "svg")
            svgNew.setAttributeNS(null, "id", "svg_dragged");
            document.getElementById("network_div").appendChild(svgNew);

            draggedElementId = $(this).attr("id").split("_")[1];
        },
        stop: function () {
            stopDragCircleInfo();
        },
        drag: function () {
            drawLineFromChildToParent($(this).attr("id"));
        }
    });

    $("#network_div").find(".drag").click(function (e) {
        $('.endpoint-delete').hide();
        $(this).find('.endpoint-delete').show();
    });

    $("#container_div").unbind().click(function (e) {
        e.preventDefault();

        if (typeof e.target.className === 'string' || e.target.className instanceof String) {
            if (!e.target.className.includes('skip-delete')) {
                $(this).find('.endpoint-delete').hide();
            }
        }
    });

    $(".endpoint-delete").unbind().click(function () {
        deleteEndPointFromStage($(this).attr("id").split('_')[1]);
    });

    endPointArray.push(node);
}

function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function findWhiteSpaceOnStage() {
    loopCount = 0
    var xpos = 0;
    var ypos = 0;
    var arrT = [xpos, ypos]

    var tempBool = checkCoordinates(arrT)

    return arrT[0] + "::" + arrT[1];
}

function checkCoordinates(arrT) {
    arrT[0] = Math.round(Math.random() * 500);
    arrT[1] = Math.round(Math.random() * 300);
    loopCount++

    var evalDone = true
    for (var i = 0; i < endPointArray.length; i++) {

        var tempX = Number(endPointArray[i].xpos.split("px")[0])
        var tempY = Number(endPointArray[i].ypos.split("px")[0])

        if (arrT[0] >= tempX && arrT[0] <= tempX + 120) {
            evalDone = false
            break;
        }

        if (arrT[1] >= tempY && arrT[1] <= tempY + 120) {
            evalDone = false
            break;
        }
    }

    if (evalDone == false && loopCount <= 10) {
        checkCoordinates(arrT)
    } else { }
    return;
}

function getLinkObjectRefFromArr(id) {
    var numToReturn = -1
    for (var i = 0; i < endPointArray.length; i++) {

        if (endPointArray[i].connectionLineId.split("_")[1] == id.split("_")[1]) {
            numToReturn = i;

        }
    }
    return numToReturn;
}

function stopDragCircleInfo() {
    if (document.getElementById("svg_dragged")) {
        $("#line_dragged").remove();
        $("#svg_dragged").remove();
    }
}

function getEndPointUUIDFromArr(id) {
    var numToReturn = -1;
    for (var i = 0; i < endPointArray.length; i++) {
        if (endPointArray[i].id == id) {
            numToReturn = i;
        }
    }
    return numToReturn;
}

function drawLineFromChildToParent(arg) {
    $("#line_dragged").remove();

    var childDivRef = $("#nodecircleinfo_" + arg.split("_")[1]);
    var parentDivRef = $("#node_" + arg.split("_")[1]);
    var networkDivRef = $("#network_div");


    var lineFromX = parentDivRef.offset().left + (parentDivRef.width() / 2) - networkDivRef.offset().left
    var lineFromY = parentDivRef.offset().top + (parentDivRef.height() / 2) - networkDivRef.offset().top


    var lineToX = childDivRef.offset().left + (childDivRef.width() / 2) - networkDivRef.offset().left;
    var lineToY = childDivRef.offset().top + (childDivRef.height() / 2) - networkDivRef.offset().top;

    var svgRef = document.getElementById("svg_dragged");
    var svgWidth = Math.abs(lineToX - lineFromX) + 20;
    var svgHeight = Math.abs(lineToY - lineFromY) + 20;

    svgRef.setAttribute('width', svgWidth);
    svgRef.setAttribute('height', svgHeight);

    var svgStartPointX = 0;
    var svgStartPointY = 0;

    if (lineToX > lineFromX) {
        svgStartPointX = lineFromX - 10;
    } else {
        svgStartPointX = lineToX - 10
    }

    if (lineToY > lineFromY) {
        svgStartPointY = lineFromY - 10;
    } else {
        svgStartPointY = lineToY - 10;
    }

    svgRef.setAttributeNS(null, "style", "z-index:201;position:absolute;left:" + svgStartPointX + "px" + ";top:" + svgStartPointY + "px");

    var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    aLine.setAttribute("id", "line_dragged");
    var lineStartX = lineFromX - svgStartPointX;
    var lineStartY = lineFromY - svgStartPointY;
    var lineEndX = lineToX - svgStartPointX;
    var lineEndY = lineToY - svgStartPointY;

    aLine.setAttribute('x1', lineStartX);
    aLine.setAttribute('y1', lineStartY);
    aLine.setAttribute('x2', lineEndX);
    aLine.setAttribute('y2', lineEndY);
    aLine.setAttribute('stroke', "#99ca3c");
    aLine.setAttribute('stroke-width', 3);
    aLine.setAttribute('class', "line");

    svgRef.appendChild(aLine);
    document.getElementById("network_div").append(svgRef)
}

function createLineFromDraggedToDropped() {
    stopDragCircleInfo();
    var svgNS = "http://www.w3.org/2000/svg";
    connectionId = connectionId + 1
    var svgId = "svg_" + connectionId;
    var svgNew = document.createElementNS(svgNS, "svg")
    svgNew.setAttributeNS(null, "id", svgId);
    var networkDivRef = $("#network_div");
    networkDivRef.append(svgNew);

    var fromDivRef = $("#node_" + draggedElementId);
    var toDivRef = $("#node_" + droppedElementId)
    var lineFromX = fromDivRef.offset().left + (fromDivRef.width() / 2) - networkDivRef.offset().left;
    var lineFromY = fromDivRef.offset().top + (fromDivRef.height() / 2) - networkDivRef.offset().top;
    var lineToX = toDivRef.offset().left + (toDivRef.width() / 2) - networkDivRef.offset().left;
    var lineToY = toDivRef.offset().top + (toDivRef.height() / 2) - networkDivRef.offset().top;

    var svgRef = document.getElementById(svgId);
    var svgWidth = Math.abs(lineToX - lineFromX) + 20;
    var svgHeight = Math.abs(lineToY - lineFromY) + 20;
    svgRef.setAttribute('width', svgWidth);
    svgRef.setAttribute('height', svgHeight);


    var svgStartPointX = 0;
    var svgStartPointY = 0;
    if (lineToX > lineFromX) {
        svgStartPointX = lineFromX - 10;
    } else {
        svgStartPointX = lineToX - 10
    }
    if (lineToY > lineFromY) {
        svgStartPointY = lineFromY - 10;
    } else {
        svgStartPointY = lineToY - 10;
    }

    svgRef.setAttributeNS(null, "style", "z-index:201;position:absolute;left:" + svgStartPointX + "px" + ";top:" + svgStartPointY + "px");

    var aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineId = "line_" + connectionId;
    aLine.setAttribute("id", lineId);
    var lineStartX = lineFromX - svgStartPointX;
    var lineStartY = lineFromY - svgStartPointY;
    var lineEndX = lineToX - svgStartPointX;
    var lineEndY = lineToY - svgStartPointY;

    aLine.setAttribute('class', "line");

    aLine.setAttribute('x1', lineStartX);
    aLine.setAttribute('y1', lineStartY);
    aLine.setAttribute('x2', lineEndX);
    aLine.setAttribute('y2', lineEndY);
    aLine.setAttribute('stroke', "#99ca3c");
    aLine.setAttribute('stroke-width', 3);

    svgRef.appendChild(aLine);
    networkDivRef.append(svgRef)

    var draggedObjaEndPointIdObj = getEndPointUUIDFromArr(draggedElementId);
    var draggedObjzEndPointIdObj = getEndPointUUIDFromArr(droppedElementId);
    var draggedObjRef = endPointArray[draggedObjaEndPointIdObj];
    var droppedObjRef = endPointArray[draggedObjzEndPointIdObj];
    endPointArray[draggedObjaEndPointIdObj];
    endPointArray[draggedObjzEndPointIdObj];

    draggedObjRef.attachedEndPoints[draggedObjRef.attachedEndPoints.length] = droppedElementId;
    droppedObjRef.attachedEndPoints[droppedObjRef.attachedEndPoints.length] = draggedElementId;
    draggedObjRef.connectionLineId[draggedObjRef.connectionLineId.length] = "line_" + connectionId;
    droppedObjRef.connectionLineId[droppedObjRef.connectionLineId.length] = "line_" + connectionId;

    defineLineEvents(`line_${connectionId}`);
}

function dropEvent(arg) {
    droppedElementId = arg.split("_")[1];

    if (droppedElementId == draggedElementId || draggedElementId == -1) {
        return;
    }

    var wantToSave = prompt('Do you want to link?');
    if (wantToSave !== null) {
        createLineFromDraggedToDropped();
        alert("Connection is created successfully");
    }
}

function checkIfLineToBeDrawFromPToP(arg) {
    if ($(`#${arg}`) != undefined) {
        var id = arg.split("_")[1];
        var idInObj = getEndPointUUIDFromArr(id);
        for (var i = 0; i < endPointArray[idInObj].attachedEndPoints.length; i++) {
            drawLineFromParentToParent(arg, endPointArray[idInObj].attachedEndPoints[i], i)
        }
    }
}

function drawLineFromParentToParent(lineFrom, lineTo, loopval) {

    var idInObj = getEndPointUUIDFromArr(lineFrom.split("_")[1]);

    var lineName = endPointArray[idInObj].connectionLineId[loopval]
    if(lineName !== undefined)
    {
    var svgNS = "http://www.w3.org/2000/svg";

    var svgId = "svg_" + lineName.split("_")[1];
    var aLine = document.getElementById(lineName)
    if (aLine == null) {

        var svgNew = document.createElementNS(svgNS, "svg")
        svgNew.setAttributeNS(null, "id", svgId);
        document.getElementById("network_div").appendChild(svgNew);
        aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        var svgRef = document.getElementById(svgId);
        aLine.setAttribute("id", lineName);
        aLine.setAttribute('stroke-width', $scope.strokewidth);
        svgRef.appendChild(aLine);
        var networkDivRef = $("#network_div");
        networkDivRef.append(svgRef)

    } else {
        aLine = document.getElementById(lineName)
    }
    var fromDivRef = $("#node_" + lineFrom.split("_")[1]);
    var toDivRef = $("#node_" + lineTo)
    var networkDivRef = $("#network_div");
    var lineFromX = fromDivRef.offset().left + (fromDivRef.width() / 2) - networkDivRef.offset().left;
    var lineFromY = fromDivRef.offset().top + (fromDivRef.height() / 2) - networkDivRef.offset().top;
    var lineToX = toDivRef.offset().left + (toDivRef.width() / 2) - networkDivRef.offset().left;
    var lineToY = toDivRef.offset().top + (toDivRef.height() / 2) - networkDivRef.offset().top;

    aLine.setAttribute('class', "line");

    var svgRef = document.getElementById(svgId);
    var svgWidth = Math.abs(lineToX - lineFromX) + 20;
    var svgHeight = Math.abs(lineToY - lineFromY) + 20;
    svgRef.setAttribute('width', svgWidth);
    svgRef.setAttribute('height', svgHeight);
    svgRef.setAttribute('source-endpoint', lineFrom.split("_")[1]);
    svgRef.setAttribute('destination-endpoint', lineTo);

    var svgStartPointX = 0;
    var svgStartPointY = 0;
    if (lineToX > lineFromX) {
        svgStartPointX = lineFromX - 10;
    } else {
        svgStartPointX = lineToX - 10
    }
    if (lineToY > lineFromY) {
        svgStartPointY = lineFromY - 10;
    } else {
        svgStartPointY = lineToY - 10;
    }
    svgRef.setAttributeNS(null, "style", "z-index:201;position:absolute;left:" + svgStartPointX + "px" + ";top:" + svgStartPointY + "px");
    var lineStartX = lineFromX - svgStartPointX;
    var lineStartY = lineFromY - svgStartPointY;
    var lineEndX = lineToX - svgStartPointX;
    var lineEndY = lineToY - svgStartPointY;
    aLine.setAttribute('x1', lineStartX);
    aLine.setAttribute('y1', lineStartY);
    aLine.setAttribute('x2', lineEndX);
    aLine.setAttribute('y2', lineEndY);
    aLine.setAttribute('linkuuid', aLine.getAttribute("linkuuid"));
    aLine.setAttribute('stroke', "#99ca3c");
}
}

function deleteEndPointFromStage(id) {
    var arrItemToSplice = -1;
    var idFoundConRef = false;

    for (var i = 0; i < endPointArray.length; i++) {
        if (endPointArray[i].id == id) {
            if (endPointArray[i].connectionLineId.length > 0) {
                idFoundConRef = true;
                break;
            }
            arrItemToSplice = i;
            break
        }
    }

    if (arrItemToSplice != -1) {
        endPointArray.splice(arrItemToSplice, 1);

        $(`#node_${id}`).remove();
        alert('Node deleted successfully.');
    }

    if (idFoundConRef) {
        alert("Please remove connection before deleting this node.");
    }
}

function defineLineEvents(conId) {

    $(`#${conId}`).off("click").on("click", function (e) {
        var parentOffset = $("#container_div").offset();
        var relativeXPosition = (e.pageX - parentOffset.left);
        var relativeYPosition = (e.pageY - parentOffset.top) - 19;
        $(".line-delete").show();
        $(".line-delete").attr('data-conid', $(this).attr('id'));
        $(".line-delete").css("left", relativeXPosition + "px")
        $(".line-delete").css("top", relativeYPosition + "px")
    });
};