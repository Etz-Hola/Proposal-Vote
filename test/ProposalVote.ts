import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProposalVote Contract", function () {
  let proposalVote: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploying the ProposalVote contract
    const ProposalVoteFactory = await ethers.getContractFactory("ProposalVote");
    proposalVote = await ProposalVoteFactory.deploy(); // Deploy the contract
  });

  it("Should create a new proposal", async function () {
    const proposalName = "New Proposal";
    const proposalDesc = "Proposal description";
    const quorum = 2;

    await expect(proposalVote.connect(owner).createProposal(proposalName, proposalDesc, quorum))
      .to.emit(proposalVote, "ProposalCreated")
      .withArgs(proposalName, quorum);

    const proposals = await proposalVote.getAllProposals();
    expect(proposals.length).to.equal(1);
    expect(proposals[0].name).to.equal(proposalName);
    expect(proposals[0].description).to.equal(proposalDesc);
    expect(proposals[0].quorum).to.equal(quorum);
    expect(proposals[0].status).to.equal(1); // PropsStatus.Created
  });



  it("Should allow voting on a proposal", async function () {
    // First, create a proposal
    const proposalName = "Test Proposal";
    const proposalDesc = "Test Description";
    const quorum = 2;

    await proposalVote.connect(owner).createProposal(proposalName, proposalDesc, quorum);

    // Vote on the proposal
    await expect(proposalVote.connect(addr1).voteOnProposal(0))
      .to.emit(proposalVote, "ProposalActive")
      .withArgs(proposalName, 1);

    const proposal = await proposalVote.getAProposal(0);
    expect(proposal.count_).to.equal(1);
    expect(proposal.status_).to.equal(2); // PropsStatus.Pending
  });

  it("Should not allow double voting", async function () {
    const proposalName = "Test Proposal";
    const proposalDesc = "Test Description";
    const quorum = 2;

    await proposalVote.connect(owner).createProposal(proposalName, proposalDesc, quorum);

    // First vote from addr1
    await proposalVote.connect(addr1).voteOnProposal(0);

    // Attempt to vote again from the same address
    await expect(proposalVote.connect(addr1).voteOnProposal(0)).to.be.revertedWith("You've voted alredy");
  });

  it("Should accept the proposal once quorum is met", async function () {
    const proposalName = "Quorum Proposal";
    const proposalDesc = "Quorum Description";
    const quorum = 2;

    await proposalVote.connect(owner).createProposal(proposalName, proposalDesc, quorum);

    // Vote from two addresses
    await proposalVote.connect(addr1).voteOnProposal(0);
    await expect(proposalVote.connect(addr2).voteOnProposal(0))
      .to.emit(proposalVote, "ProposalApproved")
      .withArgs(proposalName, 2);

    const proposal = await proposalVote.getAProposal(0);
    expect(proposal.count_).to.equal(2);
    expect(proposal.status_).to.equal(3); // PropsStatus.Accepted
  });

  it("Should revert if trying to vote on an accepted proposal", async function () {
    const proposalName = "Accepted Proposal";
    const proposalDesc = "Already Accepted";
    const quorum = 1;

    await proposalVote.connect(owner).createProposal(proposalName, proposalDesc, quorum);

    // Vote to meet the quorum
    await proposalVote.connect(addr1).voteOnProposal(0);

    // Attempt to vote again after acceptance
    await expect(proposalVote.connect(addr2).voteOnProposal(0)).to.be.revertedWith("This pproposal has been accepted already");
  });
});
