let playerInventorySlotCount = 60;

$(function() {

    $('body').fadeOut(100);

    let playerInventory = {};
    let secondaryInventory = {};

    let inventoryShown = false;

    $('.giveItemButton').droppable({
        drop: function(event, ui) { 
            let currentInv = $(ui.draggable).parent().parent();   
            fetch(`https://${GetParentResourceName()}/requestGiveItem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    currentSlot: $(ui.draggable).attr("data-slot"),
                    currentInv: { type: currentInv.data('type'), owner: currentInv.data('owner'), base: currentInv.attr('class') },
                    amount: $('.giveItemAmount').val()
                })
            }).then(resp => resp.json());
        }
    });

    var playerInventoryItemWidth = ($(".playerInventory .containerContent").width() - 16) / 5;
    let playerInventoryContainerContent = $('.playerInventory .containerContent');

    var secondaryInventoryItemWidth = ($(".secondaryInventory .containerContent").width() - 16) / 5;
    let secondaryInventoryContainerContent = $('.secondaryInventory .containerContent');
    
    for (let index = 1; index < playerInventorySlotCount + 1; index++) {
        var item = $('<div class="item" style = "background-color: #4c4c4c"><div class = "itemCountData"><h2 class = "slotNumber">' + index + '</h2><h2 class = "itemCount"></h2></div><div class = "itemContent"><div class = "itemImageBox"><img class = "itemImg" src="img/items/cash.png" height = "100%" width = "100%" alt=""></div><div class = "itemTextBox"><h1 class = "itemText">Test</h1></div></div></div>');

        playerInventoryContainerContent.append(item);
        item.css({
            'width': playerInventoryItemWidth,
            'height': playerInventoryItemWidth,
            'max-width': playerInventoryItemWidth,
            'max-height': playerInventoryItemWidth,
            'display': 'inline-block'
        });

        if (index > 5) {
            item.find('.slotNumber').css({
                'visibility': 'hidden'
            });
        }

        item.attr("data-slot", index);

        item.droppable({
            drop: function(event, ui) { 
                let currentInv = $(ui.draggable).parent().parent();   
                let targetInv = $($(this)[0]).parent().parent();
                fetch(`https://${GetParentResourceName()}/requestMoveItem`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                    },
                    body: JSON.stringify({
                        targetSlot: $($(this)[0]).attr("data-slot"),
                        currentSlot: $(ui.draggable).attr("data-slot"),
                        targetInv: { type: targetInv.data('type'), owner: targetInv.data('owner'), base: targetInv.attr('class') },
                        currentInv: { type: currentInv.data('type'), owner: currentInv.data('owner'), base: currentInv.attr('class') },
                        amount: $('.giveItemAmount').val()
                    })
                }).then(resp => resp.json());
            }
        });
    }

    for (let index = 1; index < playerInventorySlotCount + 1; index++) {
        var item = $('<div class="item" style = "background-color: #4c4c4c"><div class = "itemCountData"><h2 class = "slotNumber">' + index + '</h2><h2 class = "itemCount"></h2></div><div class = "itemContent"><div class = "itemImageBox"><img class = "itemImg" src="img/items/cash.png" height = "100%" width = "100%" alt=""></div><div class = "itemTextBox"><h1 class = "itemText">Test</h1></div></div></div>');
        secondaryInventoryContainerContent.append(item);
        item.css({
            'width': secondaryInventoryItemWidth,
            'height': secondaryInventoryItemWidth,
            'max-width': secondaryInventoryItemWidth,
            'max-height': secondaryInventoryItemWidth,
            'display': 'inline-block'
        });

        item.find('.slotNumber').css({
            'visibility': 'hidden'
        });

        item.attr("data-slot", index);

        item.droppable({
            drop: function(event, ui) {    
                let currentInv = $(ui.draggable).parent().parent();   
                let targetInv = $($(this)[0]).parent().parent();
                fetch(`https://${GetParentResourceName()}/requestMoveItem`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                    },
                    body: JSON.stringify({
                        targetSlot: $($(this)[0]).attr("data-slot"),
                        currentSlot: $(ui.draggable).attr("data-slot"),
                        targetInv: { type: targetInv.data('type'), owner: targetInv.data('owner'), base: targetInv.attr('class') },
                        currentInv: { type: currentInv.data('type'), owner: currentInv.data('owner'), base: currentInv.attr('class') },
                        amount: $('.giveItemAmount').val()
                    })
                }).then(resp => resp.json());
            }
        });
    }
    function DestroyItem(inventoryID, slot) {
        let item;

        if (inventoryID == 1) {
            item = $('.playerInventory .containerContent').find(`.item[data-slot='${slot}']`);
        } else {
            item = $('.secondaryInventory .containerContent').find(`.item[data-slot='${slot}']`);
        }

        let itemContent = item.find(".itemContent");
        let itemCount = item.find('.itemCount');
        itemContent.css("visibility", "hidden");
        itemCount.text("");
        item.draggable('disable');
        item.unbind("dblclick");
    }

    function InitializeItem(inventoryID, itemData, itemSlot) {

        let item;

        if (inventoryID == 1) {
            item = $('.playerInventory .containerContent').find(`.item[data-slot='${itemSlot}']`);
        } else {
            item = $('.secondaryInventory .containerContent').find(`.item[data-slot='${itemSlot}']`);
        }

        item.data('itemData', itemData);

        item.dblclick(function() {
            $.post(`http://${GetParentResourceName()}/UseItem`, JSON.stringify({
                itemData: itemData,
                itemSlot: itemSlot
            }));
        });

        let itemContent = item.find(".itemContent");
        let itemNameLabel = itemContent.find('.itemTextBox h1');
        let itemCount = item.find('.itemCount');
        itemContent.find(".itemImg").attr("src", "img/items/" + itemData.itemName + ".png");
        itemNameLabel.text(itemData.itemLabel);
        if (itemData.itemCount == null) {
            itemCount.text(1);
        } else {
            itemCount.text(itemData.itemCount);
        }
        itemCount.css('color', 'rgba(255, 255, 255, 0.75)');

        item.draggable({
            appendTo: 'body',
            helper: 'clone',
            revertDuration: 0,
            revert: true,
            start: function () {
                if (inventoryID == 1) {
                    let inventoryType = $('.playerInventory').data('type');
                    let inventoryOwner = $('.playerInventory').data('owner');
                    SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, true);
                } else {
                    let inventoryType = $('.secondaryInventory').data('type');
                    let inventoryOwner = $('.secondaryInventory').data('owner');
                    SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, true);
                }
            },
            stop: function () {
                if (inventoryID == 1) {
                    let inventoryType = $('.playerInventory').data('type');
                    let inventoryOwner = $('.playerInventory').data('owner');
                    SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, false);
                } else {
                    let inventoryType = $('.secondaryInventory').data('type');
                    let inventoryOwner = $('.secondaryInventory').data('owner');
                    SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, false);
                }
            }
        });

        item.draggable("enable");

        itemContent.css("visibility", "visible");
    }

    function InitializeShopItem(itemData, itemSlot) {

        let item = $('.secondaryInventory .containerContent').find(`.item[data-slot='${itemSlot}']`);

        item.data('itemData', itemData);

        let itemContent = item.find(".itemContent");
        let itemNameLabel = itemContent.find('.itemTextBox h1');
        let itemCount = item.find('.itemCount');
        itemContent.find(".itemImg").attr("src", "img/items/" + itemData.itemName + ".png");
        itemNameLabel.text(itemData.itemLabel);
        itemCount.text('$' + itemData.itemCount);
        itemCount.css('color', '#8fd9a8');

        item.draggable({
            appendTo: 'body',
            helper: 'clone',
            revertDuration: 0,
            revert: true,
            start: function () {
                $(this).css({ 'opacity': '0%' });
                let inventoryType = $('.secondaryInventory').data('type');
                let inventoryOwner = $('.secondaryInventory').data('owner');
                SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, true);
            },
            stop: function () {
                $(this).css({ 'opacity': '100%' });
                let inventoryType = $('.secondaryInventory').data('type');
                let inventoryOwner = $('.secondaryInventory').data('owner');
                SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, false);
            }
        });

        item.draggable("enable");

        itemContent.css("visibility", "visible");
    }

    window.addEventListener('message', (event) => {
        let data = event.data;
        if (data.type === 'inventoryUpdateRequest') {
            if (data.primaryInventoryData != null) {
                let itemsPrimary = data.primaryInventoryData;
                $('.playerInventory').data('type', itemsPrimary.type);
                $('.playerInventory').data('owner', itemsPrimary.owner);
                InitializeInventory(1, itemsPrimary);
            }

            if (data.secondaryInventoryData != null) {
                let itemsSecondary = data.secondaryInventoryData;
                $('.secondaryInventory').data('type', itemsSecondary.type);
                $('.secondaryInventory').data('owner', itemsSecondary.owner);
                InitializeInventory(2, itemsSecondary);
            }
        }
        
        if (data.type === 'inventoryOpenRequest') {
            $('body').fadeIn(100);
        }

        if (data.type === 'inventoryCloseRequest') { // Escape key
            $('body').fadeOut(100);
        }

        if (data.type === 'inventorySetSlotBusy') {
            /*
                client.js: 120
                let inventoryType = data.inventoryType;
                let inventoryOwner = data.inventoryOwner;
            */
            let itemSlot = data.itemSlot;
            let isBusy = data.isBusy;
            let inventoryID = data.inventoryID;

            let item = GetInventoryItem(inventoryID, itemSlot);

            if (isBusy) {
                item.find('.itemContent').css({ 'opacity': '0%' });
                item.draggable('disable');
            } else {
                item.find('.itemContent').css({ 'opacity': '100%' });
                item.draggable('enable');
            }
        }
    });

    document.onkeyup = function (data) {
        if (data.which == 113 || data.which == 71 || data.which == 27) { // Escape key
            $.post(`http://${GetParentResourceName()}/InventoryClosed`, JSON.stringify({}));
            $('body').fadeOut(100);
        }

        if ((data.which == 49 || data.which == 50 ||data.which == 51 ||data.which == 52 || data.which == 53) && !$('.giveItemAmount').is(":focus")) {
            let item = $('.playerInventory .containerContent').find(`.item[data-slot='${data.which - 48}']`);
            item.dblclick();
        }
    };

    function InitializeInventory(inventoryID, inventoryData) {

        let inventoryItems = inventoryData.items;

        if (inventoryID == 1) {
            for (let index = 0; index < Object.keys(playerInventory).length; index++) {
                let itemSlot = Object.keys(playerInventory)[index];
    
                DestroyItem(inventoryID, itemSlot);
            }
            playerInventory = inventoryItems;  
        } else {
            for (let index = 0; index < Object.keys(secondaryInventory).length; index++) {
                let itemSlot = Object.keys(secondaryInventory)[index];
    
                DestroyItem(inventoryID, itemSlot);
            }
            secondaryInventory = inventoryItems;
        }


        for (let index = 0; index < Object.keys(inventoryItems).length; index++) {
            let itemSlot = Object.keys(inventoryItems)[index];
            let item = inventoryItems[itemSlot];
            if (inventoryData.type == "shop") {
                InitializeShopItem(item, itemSlot);
            } else {
                InitializeItem(inventoryID, item, itemSlot);
            }

        }

    }

    function SetInventorySlotAsBusy(inventoryType, inventoryOwner, itemSlot, isBusy) {
        if (inventoryType != "shop") {
            $.post(`http://${GetParentResourceName()}/SetInventorySlotAsBusy`, JSON.stringify({
                inventoryType: inventoryType,
                inventoryOwner: inventoryOwner,
                itemSlot: itemSlot,
                isBusy: isBusy
            }));
        }
    }

    function GetInventoryItem(inventoryID, itemSlot) {
        let item;

        if (inventoryID == 1) {
            item = $('.playerInventory .containerContent').find(`.item[data-slot='${itemSlot}']`);
        } else {
            item = $('.secondaryInventory .containerContent').find(`.item[data-slot='${itemSlot}']`);
        }

        return item;
    }
});