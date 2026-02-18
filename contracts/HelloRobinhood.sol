// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract HelloRobinhood {

    struct Message {
        address user;
        string text;
        uint256 timestamp; // ✅ NEW
    }

    Message[] public messages;

    function updateMessage(string memory _text) public {
        messages.push(
            Message(
                msg.sender,
                _text,
                block.timestamp // ✅ saves blockchain time
            )
        );
    }

    function getMessages() public view returns (Message[] memory) {
        return messages;
    }
}
