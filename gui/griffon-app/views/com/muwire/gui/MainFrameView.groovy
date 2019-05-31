package com.muwire.gui

import griffon.core.artifact.GriffonView
import griffon.inject.MVCMember
import griffon.metadata.ArtifactProviderFor

import javax.swing.BorderFactory
import javax.swing.Box
import javax.swing.BoxLayout
import javax.swing.JSplitPane
import javax.swing.SwingConstants
import javax.swing.border.Border

import java.awt.BorderLayout
import java.awt.CardLayout
import java.awt.FlowLayout
import java.awt.GridBagConstraints
import java.awt.GridBagLayout
import java.awt.Insets

import javax.annotation.Nonnull

@ArtifactProviderFor(GriffonView)
class MainFrameView {
    @MVCMember @Nonnull
    FactoryBuilderSupport builder
    @MVCMember @Nonnull
    MainFrameModel model
    
    void initUI() {
        builder.with {
            application(size : [1024,768], id: 'main-frame',
            title: application.configuration['application.title'],
            iconImage:   imageIcon('/griffon-icon-48x48.png').image,
            iconImages: [imageIcon('/griffon-icon-48x48.png').image,
                imageIcon('/griffon-icon-32x32.png').image,
                imageIcon('/griffon-icon-16x16.png').image],
            pack : false,
            visible : bind { model.coreInitialized }) {
                borderLayout()
                panel (border: etchedBorder(), constraints : BorderLayout.NORTH) {
                    borderLayout()
                    panel (constraints: BorderLayout.WEST) {
                        gridLayout(rows:1, cols: 2)
                        button(text: "Searches", actionPerformed : showSearchWindow)
                        button(text: "Uploads", actionPerformed : showUploadsWindow)
                    }
                    panel(constraints: BorderLayout.CENTER) {
                        borderLayout()
                        label("Enter search here:", constraints: BorderLayout.WEST)
                        textField(id: "search-field", constraints: BorderLayout.CENTER, action : searchAction)
                        
                    }
                    panel( constraints: BorderLayout.EAST) {
                        button(text: "Search", searchAction)
                    }
                }
                panel (id: "cards-panel", constraints : BorderLayout.CENTER) {
                    cardLayout()
                    panel (constraints : "search window") {
                        borderLayout()
                        splitPane( orientation : JSplitPane.VERTICAL_SPLIT, dividerLocation : 500,
                        continuousLayout : true, constraints : BorderLayout.CENTER) {
                            panel (constraints : JSplitPane.TOP) {
                                borderLayout()
                                scrollPane (constraints : BorderLayout.CENTER){
                                    table(id : "results-table") {
                                        tableModel(list: model.results) {
                                            closureColumn(header: "Name", type: String, read : {row -> row.name})
                                            closureColumn(header: "Size", preferredWidth: 150, type: Long, read : {row -> row.size})
                                            closureColumn(header: "Sender", type: String, read : {row -> row.sender.getHumanReadableName()})
                                        }
                                    }
                                }
                                panel(constraints : BorderLayout.SOUTH) {
                                    button(text : "Download")
                                    button(text : "Trust")
                                    button(text : "Distrust")
                                }
                            }
                            panel (constraints : JSplitPane.BOTTOM) {
                                borderLayout()
                                scrollPane (constraints : BorderLayout.CENTER) {
                                    table(id : "downloads-table") {
                                        tableModel(list: model.downloads) {
                                            closureColumn(header: "Name", type: String, read : {row -> row.downloader.file.getName()})
                                            closureColumn(header: "Status", type: String, read : {row -> row.downloader.getCurrentState()})
                                            closureColumn(header: "Progress", type: String, read: { row ->
                                                int pieces = row.downloader.nPieces
                                                int done = row.downloader.donePieces()
                                                "$pieces/$done pieces"
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                    panel (constraints: "uploads window"){
                        label("card 2")
                    }
                }
                panel (border: etchedBorder(), constraints : BorderLayout.SOUTH) {
                }

            }
        }
    }

    def showSearchWindow = {
        def cardsPanel = builder.getVariable("cards-panel")
        cardsPanel.getLayout().show(cardsPanel, "search window")
    }

    def showUploadsWindow = {
        def cardsPanel = builder.getVariable("cards-panel")
        cardsPanel.getLayout().show(cardsPanel, "uploads window")
    }
}