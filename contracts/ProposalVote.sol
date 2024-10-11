// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract ProposalVote{

    enum PropsStatus{None, Created, Pending, Accepted}

    struct Proposal{
        string name;
        string description;
        uint16 voteCount;
        address[] voters;
        uint16 quorum;
        PropsStatus status;
    }

    mapping(address voter => mapping(uint8 indexOfProps => bool)) hasVoted;

    Proposal[] public proposals;

    //events
    event ProposalCreated(string indexed name, uint16 quorum);
    event ProposalApproved(string indexed name, uint16 count);
    event ProposalActive(string indexed name, uint16 count);

    function createProposal(string memory _name, string memory _desc, uint16 _quorum) external {
        require(msg.sender != address(0), "Zero address is not allowed");

        Proposal memory newProposal;
        newProposal.name = _name;
        newProposal.description = _desc;
        newProposal.quorum = _quorum;
        newProposal.status = PropsStatus.Created;

        proposals.push(newProposal);

        emit ProposalCreated(_name, _quorum);
    }

    function voteOnProposal(uint8 _index) external {
        require(msg.sender != address(0), "Zero address is not allow");

        require(_index < proposals.length, "Index is out-of_bound");

        require(!hasVoted[msg.sender] [_index], "You've voted alredy");

        Proposal storage currentProposal = proposals[_index];

        require(currentProposal.status != PropsStatus.Accepted, "This pproposal has been accepted already");

        currentProposal.voteCount += 1;
        currentProposal.voters.push(msg.sender);
        currentProposal.status = PropsStatus.Pending;

        hasVoted[msg.sender] [_index] = true;


        if(currentProposal.voteCount >= currentProposal.quorum){
            currentProposal.status = PropsStatus.Accepted;
            emit  ProposalApproved(currentProposal.name, currentProposal.voteCount);
        }else{
            hasVoted[msg.sender] [_index] = true;

            emit  ProposalActive(currentProposal.name, currentProposal.voteCount);
        }

    }

    function getAllProposals() external view returns (Proposal[] memory){
        return proposals;
    }
    function getAProposal(uint8 _index) external view returns (string memory name_, string memory desc_, uint16 count_, address[] memory voters_, uint16 quorum_, PropsStatus status_){
        require(msg.sender != address(0), "Zero address not allow");

        require(_index < proposals.length, "Index is out-of_bound");

        Proposal memory currentProposal = proposals[_index];
        name_ = currentProposal.name;
        desc_ = currentProposal.description;
        count_ = currentProposal.voteCount;
        voters_ = currentProposal.voters;
        quorum_ = currentProposal.quorum;
        status_ = currentProposal.status;



    }



}