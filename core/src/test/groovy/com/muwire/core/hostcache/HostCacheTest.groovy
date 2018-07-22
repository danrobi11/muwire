package com.muwire.core.hostcache

import org.junit.After
import org.junit.Before
import org.junit.Test

import com.muwire.core.Destinations
import com.muwire.core.MuWireSettings
import com.muwire.core.connection.ConnectionAttemptStatus
import com.muwire.core.connection.ConnectionEvent
import com.muwire.core.trust.TrustLevel
import com.muwire.core.trust.TrustService

import groovy.mock.interceptor.MockFor

class HostCacheTest {


	File persist
	HostCache cache
	
	def trustMock
	TrustService trust
	
	def settingsMock
	MuWireSettings settings
	
	Destinations destinations = new Destinations()
	
	@Before
	void before() {
		persist = new File("hostPersist")
		persist.delete()
		persist.deleteOnExit()
		
		trustMock = new MockFor(TrustService.class)
		settingsMock = new MockFor(MuWireSettings.class)
	}
	
	@After
	void after() {
		cache?.stop()
		trustMock.verify trust
		settingsMock.verify settings
	}
	
	private void initMocks() {
		trust = trustMock.proxyInstance()
		settings = settingsMock.proxyInstance()
		cache = new HostCache(trust, persist, 100, settings)
		cache.start()
		Thread.sleep(150)
	}
	
	@Test
	void testEmpty() {
		initMocks()
		assert cache.getHosts(5).size() == 0
	}

	@Test	
	void testOnDiscoveredEvent() {
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest1
			TrustLevel.NEUTRAL
		}
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest1
			TrustLevel.NEUTRAL
		}
		settingsMock.demand.allowUntrusted { true }
		settingsMock.demand.allowUntrusted { true }
		
		initMocks()
		
		cache.onHostDiscoveredEvent(new HostDiscoveredEvent(destination: destinations.dest1))
		
		def rv = cache.getHosts(5)
		assert rv.size() == 1
		assert rv.contains(destinations.dest1)
	}
	
	@Test
	void testOnDiscoveredUntrustedHost() {
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest1
			TrustLevel.DISTRUSTED
		}
		
		initMocks()
		
		cache.onHostDiscoveredEvent(new HostDiscoveredEvent(destination: destinations.dest1))
		assert cache.getHosts(5).size() == 0
	}
	
	@Test
	void testOnDiscoverNeutralHostsProhibited() {
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest1
			TrustLevel.NEUTRAL
		}
		settingsMock.demand.allowUntrusted { false }
		
		initMocks()
		
		cache.onHostDiscoveredEvent(new HostDiscoveredEvent(destination: destinations.dest1))
		assert cache.getHosts(5).size() == 0
	}
	
	@Test
	void test2DiscoveredGoodHosts() {
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest1
			TrustLevel.TRUSTED
		}
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest2
			TrustLevel.TRUSTED
		}
		trustMock.demand.getLevel{ d -> TrustLevel.TRUSTED }
		trustMock.demand.getLevel{ d -> TrustLevel.TRUSTED }
		
		initMocks()
		cache.onHostDiscoveredEvent(new HostDiscoveredEvent(destination: destinations.dest1))
		cache.onHostDiscoveredEvent(new HostDiscoveredEvent(destination: destinations.dest2))
		
		def rv = cache.getHosts(1)
		assert rv.size() == 1
		assert rv.contains(destinations.dest1) || rv.contains(destinations.dest2)
	}
	
	@Test
	void testHostFailed() {
		trustMock.demand.getLevel { d ->
			assert d == destinations.dest1
			TrustLevel.TRUSTED
		}
		
		initMocks()
		cache.onHostDiscoveredEvent(new HostDiscoveredEvent(destination: destinations.dest1))
		
		cache.onConnectionEvent( new ConnectionEvent(destination: destinations.dest1, status: ConnectionAttemptStatus.FAILED))
		cache.onConnectionEvent( new ConnectionEvent(destination: destinations.dest1, status: ConnectionAttemptStatus.FAILED))
		cache.onConnectionEvent( new ConnectionEvent(destination: destinations.dest1, status: ConnectionAttemptStatus.FAILED))
		
		assert cache.getHosts(5).size() == 0
	}
}
