package com.muwire.gui

import com.muwire.core.Core

import griffon.core.artifact.GriffonModel
import griffon.transform.Observable
import griffon.metadata.ArtifactProviderFor

@ArtifactProviderFor(GriffonModel)
class ChatRoomModel {
    Core core
    String tabName
    String room
}