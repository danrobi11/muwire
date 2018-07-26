package com.muwire.core.connection

import java.util.Collection
import java.util.concurrent.ConcurrentHashMap

import com.muwire.core.EventBus

import groovy.util.logging.Log
import net.i2p.data.Destination

@Log
class UltrapeerConnectionManager extends ConnectionManager {
	
	final int maxPeers, maxLeafs
	
	final Map<Destination, PeerConnection> peerConnections = new ConcurrentHashMap()
	final Map<Destination, LeafConnection> leafConnections = new ConcurrentHashMap()
	
	UltrapeerConnectionManager() {}

	public UltrapeerConnectionManager(EventBus eventBus, int maxPeers, int maxLeafs) {
		super(eventBus)
		this.maxPeers = maxPeers
		this.maxLeafs = maxLeafs
	}
	@Override
	public void drop(Destination d) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Collection<Connection> getConnections() {
		// TODO implement
		[]
	}
	
	boolean hasLeafSlots() {
		// TODO implement
		true
	}
	
	boolean hasPeerSlots() {
		// TODO implement
		true
	}
	@Override
	protected int getDesiredConnections() {
		return maxPeers / 2;
	}
	@Override
	public boolean isConnected(Destination d) {
		peerConnections.containsKey(d) || leafConnections.containsKey(d)
	}

	@Override
	public void onConnectionEvent(ConnectionEvent e) {
		if (!e.incoming && e.leaf) {
			log.severe("Inconsistent event $e")
			return
		}
		
		Connection c = e.leaf ? new LeafConnection(eventBus, e.endpoint) : new PeerConnection(eventBus, e.endpoint, e.incoming)
		// TODO: start and stuff
		def map = e.leaf ? leafConnections : peerConnections
		map.put(e.endpoint.destination, c)
	}
}
