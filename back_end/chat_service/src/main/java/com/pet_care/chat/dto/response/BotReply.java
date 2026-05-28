package com.pet_care.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BotReply {

    private String text;

    @Builder.Default
    private List<SuggestionCard> suggestions = new ArrayList<>();
}
